// Google Maps functionality

$(function () {
    var options = {
        center: new google.maps.LatLng(39.67337, -116.795654),
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("gmap"), options);
});

