var trafficData;
var barChart;
var currentAirportCode = 'MAD';
var allDepartures;
var allArrivals;

$(document).ready(function() {

    "use strict"; // Start of use strict

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
                    loadAirportData(item.value);
                    loadDepTable(item.value);
                    loadArrTable(item.value);
                    return item.html;
                };

            }

    });

/*****************************************************************
*
*                    CHART
*
* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    // Initialize chart
    $("#barChart").css("display", "none");

    $.ajax({
        type: 'GET',
        url: '/api/airport-traffic/?format=json&orient=records',
        dataType: 'json',
        success: function (data) {

            /**
             * Create the map
             */

            trafficData = data;

            var airportSelect = $("#airport-select");

            airportSelect.val(currentAirportCode);

            airportSelect.trigger("chosen:updated");

            $("#barChart").css("display", "block");
            $("#barChart").parent().siblings(".loader-circle").css("display", "none");
            // document.getElementById("loader-circle").style.display = "none";
        }
    });

/*****************************************************************
*
*                    DEPARTURES TABLE
*
* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    //Initialize departures table
    $('#depTable').hide();

    $.ajax({
        type: 'GET',
        url: '/api/departures/?format=json&orient=records',
        dataType: 'json',
        success: function (dep_data) {

            allDepartures = dep_data;

            var airportSelect = $("#airport-select");

            airportSelect.val(currentAirportCode);

            airportSelect.trigger("chosen:updated");

            $('#depTable').show();
            $('#depTable').parent().parent().parent().siblings('.loader-circle').hide();

        }
    });


/*****************************************************************
*
*                    ARRIVALS TABLE
*
* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    //Initialize departures table
    $('#arrTable').hide();

    $.ajax({
        type: 'GET',
        url: '/api/arrivals/?format=json&orient=records',
        dataType: 'json',
        success: function (arr_data) {

            allArrivals = arr_data;

            var airportSelect = $("#airport-select");

            airportSelect.val(currentAirportCode);

            airportSelect.trigger("chosen:updated");

            $('#arrTable').show();
            $('#arrTable').parent().parent().parent().siblings('.loader-circle').hide();

        }
    });



});



function filterFlightsByAirport(item) {
    return (item && item.AIRPORT === currentAirportCode);
}

function filterDeparturesByAirport(item) {
    return (item && item.DEP === currentAirportCode);
}

function filterArrivalsByAirport(item) {
    return (item && item.ARR === currentAirportCode);
}


function formatDate(dateStr) {
    var newDate = new Date(dateStr);

    var formatted = newDate.getDate() + "/" + newDate.getMonth() + "/" + newDate.getFullYear();

    return formatted;
}

function loadAirportData(airportCode) {

    currentAirportCode = airportCode;

    var airportData = trafficData.filter(filterFlightsByAirport);

    if (!airportData.length) {
        console.log('entra');
        $("#barChart").css("display", "none");

    } else {
        $("#barChart").css("display", "block");

        var dateList = [];
        var departureList = [];
        var arrivalList = [];

        airportData.forEach(function (item) {
            dateList.push(formatDate(item.DATE));
            departureList.push(item.DEPARTURES);
            arrivalList.push(item.ARRIVALS);
        });

        var dom = document.getElementById("barChart");
        barChart = echarts.init(dom);

        var app = {};
        var option = null;
        option = {
            color: ['#4aa9e9','#67f3e4'],
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['Departures','Arrivals']
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : dateList
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name: 'Departures',
                    type: 'bar',
                    data: departureList,
                    markPoint : {
                        data : [
                            {type : 'max', name: 'Max'},
                            {type : 'min', name: 'Min'}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name: 'Average'}
                        ]
                    }
                },
                {
                    name: 'Arrivals',
                    type: 'bar',
                    data: arrivalList,
                    markPoint : {
                        data : [
                            {type : 'max', name: 'Max'},
                            {type : 'min', name: 'Min'}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name : 'Average'}
                        ]
                    }
                }
            ]
        };

        if (option && typeof option === "object") {
            barChart.setOption(option, false);
        }
    }

}

function loadDepTable(airportCode) {
    currentAirportCode = airportCode;

    if (allDepartures) {
        var tableData = allDepartures.filter(filterDeparturesByAirport);

        $("#depTable").dataTable().fnDestroy()

        $('#depTable').DataTable({
            // dom: 'Bfrtip',
            data: tableData,
            buttons: ['csv', 'excel', 'pdf', 'print'],
            pageLength: 10,
            select: false,
            bDeferRender: true,
            columns: [
                { data: 'DEP' },
                { data: 'ARR' },
                { data: 'FLIGHTS' },
                { data: 'DURATION' },
            ]

        });

    }


}

function loadArrTable(airportCode) {
    currentAirportCode = airportCode;

    if (allArrivals) {
        var tableData = allArrivals.filter(filterArrivalsByAirport);

        $("#arrTable").dataTable().fnDestroy()

        $('#arrTable').DataTable({
            // dom: 'Bfrtip',
            data: tableData,
            buttons: ['csv', 'excel', 'pdf', 'print'],
            pageLength: 10,
            select: false,
            bDeferRender: true,
            columns: [
                { data: 'DEP' },
                { data: 'ARR' },
                { data: 'FLIGHTS' },
                { data: 'DURATION' },
            ]

        });

    }


}

window.onresize = function() {
    if (barChart) {
        barChart.resize();
    }
};





