
$(document).ready(function() {

    $.ajax({
            type: 'GET',
            url: '/api/flights-by-date/?format=json&orient=records',
            // data: { get_param: 'value' },
            dataType: 'json',
            success: function (data) {
                $("#total-days").html(data.length);

                var totalFlights = 0;

                data.forEach(function (item) {
                    totalFlights += item.FLIGHTS;
                });

                $("#total-flights").html(totalFlights);

				// LINE CHART
				var line = new Morris.Line( {
					element: 'flights-line-chart',
					resize: true,
					data: data,
					xkey: 'DATE',
					ykeys: [ 'FLIGHTS' ],
					labels: [ 'Flights' ],
					gridLineColor: '#eef0f2',
					lineColors: [ '#4680ff' ],
					lineWidth: 1,
					hideHover: 'auto'
				} );

				$("#flights-line-chart").parent().siblings(".loader-circle").hide();
            }

    });

    $.ajax({
            type: 'GET',
            url: '/api/routes-by-date/?format=json&orient=records',
            // data: { get_param: 'value' },
            dataType: 'json',
            success: function (data) {

                var totalRoutes = 0;

                data.forEach(function (item) {
                    totalRoutes += item.ROUTES;
                });

                $("#total-routes").html(totalRoutes);

				// LINE CHART
				var line = new Morris.Line( {
					element: 'routes-line-chart',
					resize: true,
					data: data,
					xkey: 'DATE',
					ykeys: [ 'ROUTES' ],
					labels: [ 'Routes' ],
					xLabels: 'day',
					gridLineColor: '#eef0f2',
					lineColors: [ '#4680ff' ],
					lineWidth: 1,
					hideHover: 'auto'
				} );

				$("#routes-line-chart").parent().siblings(".loader-circle").hide();
            }

    });

    $.ajax({
            type: 'GET',
            url: '/api/airport-traffic/',
            // url: '/api/airport-traffic/?format=json&orient=records',
            data: { format: 'json', orient: 'records' },
            dataType: 'json',
            success: function (data) {

                airportList = [];

                data.forEach(function (item) {
                    if (!(item.AIRPORT in airportList)) {
                        airportList.push(item.AIRPORT);
                    }
                });

                $("#total-airports").html(airportList.length);

            }

    });


});

