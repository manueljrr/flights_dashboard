// Data from API
var flightsData = [];
var trafficData = {};
var currentInfoWindow = null;
var startDate = new Date("07/24/2017");
var endDate = new Date("07/30/2017");

var MAP_STYLES = [
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#95abff"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "stylers": [
      {
        "color": "#5b69bc"
      },
      {
        "lightness": 55
      },
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]


$(document).ready(function() {


    // Date range picker settings
    var calendar = $(document).find(".date-range input");

    calendar.daterangepicker({
        opens: 'left',
        startDate: startDate,
        endDate: endDate
    }, function(start, end, label) {
        startDate = start;
        endDate = end;

        generateTrafficData();

        generateTrafficMap();

    });


    var flightsMap = document.getElementById("flights-map");
    flightsMap.style.display = "none";

    // var flightsData = [];


    $.ajax({
            type: 'GET',
            url: '/api/airport-traffic/?format=json&orient=records',
            // data: { get_param: 'value' },
            dataType: 'json',
            success: function (data) {

                /**
                 * Create the map
                 */
                flightsData = data;

                flightsData.forEach(function (flight) {
                    flight['DATE'] = new Date(flight['DATE']);
                });

                generateTrafficData();

                document.getElementById("flights-map").style.display = "block";
                document.getElementById("loader-circle").style.display = "none";

                generateTrafficMap();

            }
        });


});

function filterFlightsByDateRange(item) {
    return (item && item.DATE >= startDate && item.DATE <= endDate);
}

function generateTrafficData() {
    trafficData = {
        'airports': {},
        'maxDepartures': 0,
        'maxArrivals': 0,
        'maxFlights': 0
    };

    flightsData.filter(filterFlightsByDateRange).forEach(function (flight) {
        // Append to dict if not exists
        if (!(flight.AIRPORT in trafficData.airports)) {
            trafficData.airports[flight.AIRPORT] = AIRPORTS[flight.AIRPORT];
            // trafficData.airports[flight.AIRPORT].code = flight.AIRPORT;
            trafficData.airports[flight.AIRPORT].departures = flight.DEPARTURES;
            trafficData.airports[flight.AIRPORT].arrivals = flight.ARRIVALS;
            trafficData.airports[flight.AIRPORT].flights = flight.DEPARTURES + flight.ARRIVALS;
        } else {
            // Increase total flights (departures and arrivals)
            trafficData.airports[flight.AIRPORT].departures += flight.DEPARTURES;
            trafficData.airports[flight.AIRPORT].arrivals += flight.ARRIVALS;
            trafficData.airports[flight.AIRPORT].flights += flight.DEPARTURES + flight.ARRIVALS;
        }

        trafficData.maxDepartures = Math.max(trafficData.airports[flight.AIRPORT].departures, trafficData.maxDepartures);
        trafficData.maxArrivals = Math.max(trafficData.airports[flight.AIRPORT].arrivals, trafficData.maxArrivals);
        trafficData.maxFlights = Math.max(trafficData.airports[flight.AIRPORT].flights, trafficData.maxFlights);
    });

}

function generateTrafficMap() {

    var map = new google.maps.Map(document.getElementById("flights-map"), {
        draggable: true,
        panControl: false,
        streetViewControl: false,
        scrollwheel: true,
        scaleControl: false,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        zoom: 4,
        center: new google.maps.LatLng(47.674324, 12.515118),
        styles: MAP_STYLES
    });

    var airportList = [];
    var zIndex = 50;

    for (airport in trafficData.airports) {
        airportData = trafficData.airports[airport];

        // airportList.push(airportData);

        airportCircle = new google.maps.Circle({
            strokeColor: '#E5343D',
            fillColor: '#E5343D',
            strokeOpacity: 0.7,
            strokeWeight: 0.2,
            fillOpacity: 0.35,
            zIndex: zIndex++,
            clickable: true,
            map: map,
            center: new google.maps.LatLng(airportData.latitude_deg, airportData.longitude_deg),
            radius: Math.sqrt(airportData.flights/ trafficData.maxFlights) * 150000
        });

        airportCircle.name = airportData.name;
        airportCircle.code = airportData.code;
        airportCircle.flights = airportData.flights;
        airportCircle.arrivals = airportData.arrivals;
        airportCircle.departures = airportData.departures;

        airportCircle.addListener('click', function(event) {
            if (currentInfoWindow)
                currentInfoWindow.close();

            var windowcContent = "<div style='width: 220px'>";
            windowcContent += "<h4>" + this.name + "</h4>";
            windowcContent += "<div class='row'><div class='col-7'>";
            windowcContent += "Departures: " + this.departures + "<br>";
            windowcContent += "Arrivals: " + this.arrivals + "<br>";
            windowcContent += "Total: " + this.flights + "</div>";
            windowcContent += "<div class='col-5 '><h2>" + this.code + "</h2>";
            windowcContent += "</div></div>";

            // var windowcContent = "<div>";
            // windowcContent += "<h4>" + this.code + " - " + this.name + "</h4><p>";
            // windowcContent += "Departures: " + this.departures + "<br>";
            // windowcContent += "Arrivals: " + this.arrivals + "<br>";
            // windowcContent += "Total: " + this.flights;
            // windowcContent += "</p></div>";

            var infoWindow = new google.maps.InfoWindow({
                content: windowcContent
            });

            infoWindow.open(map);
            infoWindow.setPosition(this.center);
            currentInfoWindow = infoWindow;

        });

        // graphData.push({
        //     name: airport_data.name,
        //     code: airport_data.code,
        //     flights: airport_data.flights,
        //     latitude: airport_data.latitude_deg,
        //     longitude: airport_data.longitude_deg
        // });

    }


}