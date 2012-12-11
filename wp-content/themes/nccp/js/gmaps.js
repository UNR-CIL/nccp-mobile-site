// Google Maps functionality

$(function () {
	// Set the map options
    var options = {
        center: new google.maps.LatLng(39.67337, -116.795654),
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles:
        [
          {
            "featureType": "administrative.province",
            "stylers": [
              { "weight": 2.7 }
            ]
          },{
            "featureType": "poi",
            "stylers": [
              { "visibility": "on" },
              { "lightness": -11 },
              { "saturation": 10 }
            ]
          },{
            "featureType": "road",
            "stylers": [
              { "weight": 2.1 },
              { "saturation": -11 },
              { "gamma": 0.85 },
              { "lightness": -4 }
            ]
          },{
          }
        ]
    };

    // Create the map
    var map = new google.maps.Map(document.getElementById("gmap"), options);

    // Load gmap icons/infoboxes if gmap exists
    
    var markers = [];
    var infoboxes = [];

	if ( $('#gmap').length ) {
		$.post( '/data/index.php/api/get_sensor_locations', function ( response ) { 
			var locations = $.parseJSON( response );
			
			$.each( locations, function () {			    
				//console.log( this );
				var marker = createMarker( map, this.lat, this.lng, true, '/wp-content/themes/nccp/img/map-marker-64.png' );
				
				// Create infobox at marker
				var infobox = createInfoBox( map, marker, this.lat, this.lng, "Stuff" ); 
			});			
		});
	}
});

// Create map marker at the specific location with the specified icon
function createMarker ( map, lat, lng, visible, icon ) {    
    var marker = new google.maps.Marker({
        map: map,
        draggable: true,
        position: new google.maps.LatLng( lat, lng ),
        visible: false
    });
    
    if ( visible )
        marker.setVisible( true );
        
    if ( icon )
        marker.setIcon( icon );
        
    marker.set( 'class', 'map-marker' );
    
    return marker;
}

// Create an infobox at the specified coordinates with the passed contents
function createInfoBox ( map, marker, lat, lng, content ) {
    var box = {};
    
    box.ib = new InfoBox({
        content: content,
        disableAutoPan: false,
        maxWidth: 0,
        pixelOffset: new google.maps.Size(-40, -60),
        zIndex: 1000001,
        boxStyle: { 
            opacity: 0.75,
            width: "100px"
        },

        isHidden: false,
        pane: "floatPane",
        enableEventPropagation: true
    });

    
    /*google.maps.event.addDomListener( box.ib, 'domready', function () {
        // Format the markers/infoboxes after placing    
        $('.infoBox .region-content').each( function () {    
            var content = $(this).find('.content');
            
            content.height( content.width() ); // Square the element off       
            content.css( 'top', Math.floor( ( content.height() - content.find('.headline').height() ) / 2 ) ); // Adjust the top margin  
        });
           
    });*/
    
    // Save the marker and map so this can be reopened
    //box.map = map;
    //box.marker = createMarker( map, lat, lng );
    
    // Make a quick wrapper for opening this infobox
    box.open = function () {
        box.ib.open( map, marker );
    }
    
    return box;

}
