
    var AIRPORTS = {};
    var AIRPORT_CODES = [];

    $.ajax({
            type: 'GET',
            url: '/api/airports/?format=json&orient=index',
            // data: { get_param: 'value' },
            dataType: 'json',
            success: function (airport_data) {
                AIRPORTS = airport_data;
            }

    });


    $.ajax({
            type: 'GET',
            url: 'https://api.openweathermap.org/data/2.5/weather?lat=10.9126033782958&lon=-63.9665985107421&appid=7b5cea427f69f394ba68d873faf3b640&units=metric',
            // url: 'https://api.openweathermap.org/data/2.5/weather?&&&units=metric',
            data: {
                lat: 10.9126033782958,
                lon: -63.9665985107421,
                units: 'metric',
                appid: '7b5cea427f69f394ba68d873faf3b640'
            },
            dataType: 'json',
            success: function (weather_data) {
                // console.log(weather_data);
            }

    });



