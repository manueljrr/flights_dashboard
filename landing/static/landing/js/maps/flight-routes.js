
// Data from API
var routesData = {};
// Airport routes dict
var airportRoutes = {};
var startDate = new Date("07/24/2017");
var endDate = new Date("07/30/2017");
var currentAirport = 'MAD';

    /**
     * SVG path for target icon
     */
    var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

    /**
     * SVG path for plane icon
     */
    var planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";

$(document).ready(function() {

    "use strict"; // Start of use strict

    // Date range picker settings
    var calendar = $(document).find(".date-range input");

    calendar.daterangepicker({
        opens: 'left',
        startDate: startDate,
        endDate: endDate
    }, function(start, end, label) {
        startDate = start;
        endDate = end;

        generateAirportRoutes();

        loadFlightRoutesMap(currentAirport);
    });

    // Load Airports data in airports select
    $.ajax({
            type: 'GET',
            url: '/api/airports/?format=json&orient=index',
            // data: { get_param: 'value' },
            dataType: 'json',
            success: function (airport_data) {
                AIRPORTS = airport_data;
                var airportSelect = $(".airport-select");
                var airportCode, airportData;

                AIRPORT_CODES = [];
                for (airportCode in AIRPORTS) {
                    AIRPORT_CODES.push(airportCode);
                }
                AIRPORT_CODES.sort();

                AIRPORT_CODES.forEach(function (airportCode) {
                    airportData = AIRPORTS[airportCode];
                    var newOption = new Option(airportData.code + " | " + airportData.name, airportData.code, false, false);
                    airportSelect.append(newOption);
                });

                airportSelect.chosen({
                    max_shown_results: 15,
                });

                airportSelect.data('chosen').choice_label = function(item) {
                    loadFlightRoutesMap(item.value, startDate, endDate);
                    return item.html;
                };

            }

    });


     document.getElementById("chartMap").style.display = "none";

     $.ajax({
            type: 'GET',
            url: '/api/routes/?format=json&orient=records',
            dataType: 'json',
            success: function (routes_data) {

                /**
                 * Create the map
                 */

                routesData = routes_data;

                routesData.forEach(function (route) {
                    route['DATE'] = new Date(route['DATE']);
                });

                generateAirportRoutes();


                var defaultAirport = 'MAD';

                document.getElementById("chartMap").style.display = "none";

                var airportSelect = $("#airport-select");

                airportSelect.val(defaultAirport);

                airportSelect.trigger("chosen:updated");

                document.getElementById("chartMap").style.display = "block";
                document.getElementById("loader-circle").style.display = "none";
            }
     });



});

function filterFlightsByDateRange(item) {
    return (item && item.DATE >= startDate && item.DATE <= endDate);
}

function generateAirportRoutes() {
    airportRoutes = {
        'airports': {}
    };

    routesData.filter(filterFlightsByDateRange).forEach(function (route) {
        // Append to dict if not exists
        if (!(route.DEP in airportRoutes.airports)) {
            airportRoutes.airports[route.DEP] = AIRPORTS[route.DEP];
            airportRoutes.airports[route.DEP].destinations = [AIRPORTS[route.ARR]];
        } else {
            // Increase total flights (departures and arrivals)
            if (airportRoutes.airports[route.DEP].destinations.indexOf(AIRPORTS[route.ARR]) < 0) {
                airportRoutes.airports[route.DEP].destinations.push(AIRPORTS[route.ARR]);
            }

        }

    });

}

function loadFlightRoutesMap(airportCode) {
    currentAirport = airportCode;

    // Filter data by airport and date range

    airportData = airportRoutes.airports[airportCode];
     var lines = [];

     var images =  [];

    images.push(
        {
            "svgPath": targetSVG,
            "title": airportData ? airportData.name : AIRPORTS[airportCode].name,
            "latitude": airportData ? airportData.latitude_deg : AIRPORTS[airportCode].latitude_deg,
            "longitude": airportData ? airportData.longitude_deg : AIRPORTS[airportCode].longitude_deg
        }
    );

    if (airportData) {
         airportData.destinations.forEach(function (destination) {
             lines.push(
                 {
                     "arc": -0.85,
                     "color": "#E5343D",
                     "alpha": 0.3,
                     "latitudes": [airportData.latitude_deg, destination.latitude_deg],
                     "longitudes": [airportData.longitude_deg, destination.longitude_deg]
                 }
             );

             images.push(
                 {
                     "svgPath": targetSVG,
                     "title": destination.name,
                     "latitude": destination.latitude_deg,
                     "longitude": destination.longitude_deg
                 }
             );

         });
     }


     var map = AmCharts.makeChart("chartMap", {
         "type": "map",
         "theme": "light",
         "hideCredits": true,
         "projection": "winkel3",
         "dataProvider": {
             "map": "worldLow",
             "zoomLatitude": airportData ? airportData.latitude_deg : AIRPORTS[airportCode].latitude_deg,
             "zoomLongitude": airportData ? airportData.longitude_deg : AIRPORTS[airportCode].longitude_deg,
             "zoomLevel": 3,
             "lines": lines,
             "images": images,
         },

         "areasSettings": {
             "unlistedAreasColor": "#5b69bc"
         },

         "imagesSettings": {
             "color": "#E5343D",
             "rollOverColor": "#E5343D",
             "selectedColor": "#E5343D",
         },

         "linesSettings": {
             "color": "#E5343D",
             "alpha": 0.4,
             "arrow": "middle",
             "arrowAlpha": 1,
             "arrowSize": 4
         },

         "export": {
             "enabled": true
         }

     });
}