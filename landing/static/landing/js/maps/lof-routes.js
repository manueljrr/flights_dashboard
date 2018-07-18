/**
 * SVG path for target icon
 */
var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

/**
 * SVG path for plane icon
 */
var planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";

var startDate = new Date("07/24/2017");
var endDate = new Date("07/30/2017");
var lofRoutesData = {};
var routesByDate = {};
var lofRoutes = {};

$(document).ready(function() {

    "use strict"; // Start of use strict

    // Date range picker settings
    var calendar = $(document).find(".date-range input");

    $('#routeTable').hide();

    calendar.daterangepicker({
        opens: 'left',
        startDate: startDate,
        endDate: endDate
    }, function(start, end, label) {
        startDate = start;
        endDate = end;

        fillRouteSelect();
    });

    document.getElementById("chartMap").style.display = "none";

    // $(document).ready(function() {
        $.ajax({
            type: 'GET',
            url: '/api/lof-routes/?format=json&orient=records',
            // data: { get_param: 'value' },
            dataType: 'json',
            success: function (data) {

                lofRoutesData = data;

                generateMapsData();

                fillRouteSelect();

                document.getElementById("chartMap").style.display = "block";
                document.getElementById("loader-circle").style.display = "none";

            }
        });
    // });



});

function fillRouteSelect() {
        var routeSelect = $(".route-select");

        var lofCodes = [];

        for (var date in routesByDate) {
            var parsedDate = new Date(date);

            if (parsedDate >= startDate && parsedDate <= endDate) {
                lofCodes = lofCodes.concat(routesByDate[date]);
            }
        }
        lofCodes.sort();

        lofCodes.forEach(function (lofCode) {
            var newOption = new Option(lofCode, lofCode, false, false);
            routeSelect.append(newOption);
        });

        routeSelect.chosen({
            max_shown_results: 15
        });

        routeSelect.data('chosen').choice_label = function(item) {
            // loadFlightRoutesMap(item.value, startDate, endDate);
            generateRoutesMap(item.value);

            return item.html;
        };

        routeSelect.trigger("chosen:updated");

}

function generateMapsData() {
    routesByDate = {};
    lofRoutes = {};

    for (var date in lofRoutesData) {
        routesByDate[date] = [];
        for (var lofId in lofRoutesData[date]) {
            routesByDate[date].push(lofId);

            lofRoutes[lofId] = lofRoutesData[date][lofId];
        }
    }
}

function generateRoutesMap(lofId) {

    var latitudes = [AIRPORTS[lofRoutes[lofId][0].DEP].latitude_deg];
    var longitudes = [AIRPORTS[lofRoutes[lofId][0].DEP].longitude_deg];
    var images = [];
    var includedAirports = [];


    lofRoutes[lofId].forEach(function (flight) {
        latitudes.push(AIRPORTS[flight.ARR].latitude_deg);
        longitudes.push(AIRPORTS[flight.ARR].longitude_deg);

        if (!(includedAirports.includes(flight.DEP))){
            includedAirports.push(flight.DEP);

            var newImage = {
                "svgPath": targetSVG,
                "title": AIRPORTS[flight.DEP].code + "| " + AIRPORTS[flight.DEP].name,
                "latitude": AIRPORTS[flight.DEP].latitude_deg,
                "longitude": AIRPORTS[flight.DEP].longitude_deg
            };

            images.push(newImage);
        }
    });

    images.push({
         "svgPath": planeSVG,
         "positionOnLine": 0,
         "color": "#000000",
         "alpha": 0.1,
         "animateAlongLine": true,
         "lineId": "line2",
         "flipDirection": true,
         "loop": true,
         "scale": 0.03,
         "positionScale": 1.3
    });
    images.push({
         "svgPath": planeSVG,
         "positionOnLine": 0,
         "color": "#585869",
         "animateAlongLine": true,
         "lineId": "line1",
         "flipDirection": true,
         "loop": true,
         "scale": 0.03,
         "positionScale": 1.8
    });

    /**
     * Create the map
     */
    var map = AmCharts.makeChart("chartMap", {
        "type": "map",
        "theme": "light",
        "hideCredits": true,
        "projection": "winkel3",
        "dataProvider": {
            "map": "worldLow",
             "zoomLatitude": latitudes[0],
             "zoomLongitude": longitudes[0],
             "zoomLevel": 4,

            "lines": [{
                "id": "line1",
                "arc": -0.85,
                "alpha": 0.3,
                "latitudes": latitudes,
                "longitudes": longitudes
            }, {
                "id": "line2",
                "alpha": 0,
                "color": "#E5343D",
                "latitudes": latitudes,
                "longitudes": longitudes
            }],
            "images": images,

        },

        "areasSettings": {
            "unlistedAreasColor": "#5b69bc"
        },

        "imagesSettings": {
            "color": "#E5343D",
            "rollOverColor": "#E5343D",
            "selectedColor": "#E5343D",
            "pauseDuration": 0.2,
            "animationDuration": 8,
            "adjustAnimationSpeed": true
        },

        "linesSettings": {
            "color": "#E5343D",
            "alpha": 0.4
        },

        "export": {
            "enabled": true
        }

    });

    /**
     * Create the table
     */
    $('#routeTable').show();
    $("#routeTable").dataTable().fnDestroy()

    $('#routeTable').DataTable({
        // dom: 'Bfrtip',
        data: lofRoutes[lofId],
        buttons: ['csv', 'excel', 'pdf', 'print'],
        pageLength: 10,
        select: false,
        searching: false,
        paging: false,
        ordering: false,
        bDeferRender: true,
        columns: [
            { data: 'DEP' },
            { data: 'DEP_TIME' },
            { data: 'ARR' },
            { data: 'ARR_TIME' },
        ]

    });

    $('#routeTable').parent().parent().parent().siblings('.loader-circle').hide();

}

function dateKey(date) {
    var dateStr = (date.getMonth() < 10) ? "0" : "";

    dateStr += date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();

    return dateStr;
}