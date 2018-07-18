$(document).ready(function() {
    // Data table initialization
    $('#myTable').DataTable();

    $(document).ready(function() {
        // Row grouping initialization
        var table = $('#example').DataTable({
            "columnDefs": [{
                "visible": false,
                "targets": 2
            }],
            "order": [
                [2, 'asc']
            ],
            "displayLength": 25,
            "drawCallback": function(settings) {
                var api = this.api();
                var rows = api.rows({
                    page: 'current'
                }).nodes();
                var last = null;
                api.column(2, {
                    page: 'current'
                }).data().each(function(group, i) {
                    if (last !== group) {
                        $(rows).eq(i).before('<tr class="group"><td colspan="5">' + group + '</td></tr>');
                        last = group;}});}
        });

        // Order by the grouping
        $('#example tbody').on('click', 'tr.group', function() {
            var currentOrder = table.order()[0];
            if (currentOrder[0] === 2 && currentOrder[1] === 'asc') {
                table.order([2, 'desc']).draw();
            } else {
                table.order([2, 'asc']).draw();
            }
        });
    });

    // Data export initialization
    // var flights_data= "{{flights}}";
    // console.log(flights_data);


    // $(document).ready(function() {
        $.ajax({
            type: 'GET',
            url: '/api/data/?format=json&orient=records',
            // data: { get_param: 'value' },
            dataType: 'json',
            success: function (flights_data) {

                $('#example23').DataTable({
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
    // });


});


