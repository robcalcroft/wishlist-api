$(function() {
    // Date picker
    $('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 100,
        min: new Date(1920,1,1),
        max: new Date(),
        format: 'dd-mm-yyyy'
    });
});
