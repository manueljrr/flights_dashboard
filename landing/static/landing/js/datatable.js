

$(document).ready(function () {

    $('#flights-table').hide();

    $.ajax({
        type: 'GET',
        url: '/api/data/?format=json&orient=records',
        // data: { get_param: 'value' },
        dataType: 'json',
        success: function (flights_data) {

            $('#flights-table').show();

            $('#flights-table').parent().siblings('.loader-circle').hide();

            $('#flights-table').DataTable({
                // dom: 'Bfrtip',
                data: flights_data,
                buttons: [
                    'copy', 'csv', 'excel', 'pdf', 'print'
                ],
                pageLength: 25,
                lengthMenu: [ 5, 10, 25, 50, 75, 100 ],
                select: true,
                bDeferRender: true,
                columns: [
                    { data: 'Id' },
                    { data: 'DATE', type: 'date', targets: 0 },
                    { data: 'DEP' },
                    { data: 'DEP_TIME', type: 'time', targets: 0 },
                    { data: 'DEP_LOCAL_TIME' },
                    { data: 'ARR' },
                    { data: 'ARR_TIME' },
                    { data: 'ARR_LOCAL_TIME' },
                    { data: 'BaseIataCode' },
                    { data: 'LOF_ID' }
                ]

            });
        }
    });
});



