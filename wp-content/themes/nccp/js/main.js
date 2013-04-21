// Main javascript functionality (not including gmaps, which has a separate file)

// The normal jquery init event will only be fired on initial page load, not AJAX loads
// This means control events should be bound here because they're bound in pageinit they'll be
// bound with EVERY pageload instead of only once
$( function () {

	// Make sure big text fits correctly
    $('.fittext').fitText();
    $(window).trigger( 'resize' );
    setTimeout( function () {
    	$(window).trigger( 'resize' );
    }, 250 );
    
    // Go to previous on right swipe

    $(window).swiperight( function () {
        if ( $('.ui-page-active .page-prev').length )
        $.mobile.changePage( $('.ui-page-active .page-prev').attr( 'href' ), {
            transition: 'slide',
            reverse: true
        });
    });

    // Go to next page on left swipe

    $(window).swipeleft( function () {
        if ( $('.ui-page-active .page-next').length )
        $.mobile.changePage( $('.ui-page-active .page-next').attr( 'href' ), {
            transition: 'slide'
        });
    });  

    // Data events

    $(".data-form input[type='checkbox']").on( "change", function(event, ui) {
        // Last bit with removeClass is necessary due to a bug with JQM on button refresh
        $(this).parent().children('label').buttonMarkup({theme: $(this).prop('checked') ? 'a' : 'b' }).removeClass('ui-btn-hover-b');
    });

});

// This stuff will fire on every page load, AJAX or otherwise
$(document).bind( 'pageinit', function () {

    // Find the parent page - this will change as pages are loaded dynamically and you
    // can't reliably use the widget selectors because they won't have gone through yet by the
    // time pageinit fires.  All parent selectors should be namespaced by this (i.e. page.find( blah ) 
    // instead of $( blah ))
    var page = ( $('#page[data-external-page="true"]').length ) ? $('#page[data-external-page="true"]') : $('#page');

    // Make sure big text fits correctly
    page.find('.fittext').fitText();
    $(window).trigger( 'resize' );
    setTimeout( function () {
    	$(window).trigger( 'resize' );
    }, 250 );
    
    // Get server status - the status starts as Unknown so there's no
    // need to set that status explicitly
    
    if ( $('#status').length ) {
        
        // Check the main server status
        get_server_status( 'website', function ( status ) {           
            if ( status.error )
                $('#nccp-status').removeClass( 'unknown' ).addClass( 'bad' ).find( '.status-text' ).html( "The NCCP Portal is <b>down</b>" );
            else if ( status.success )
                $('#nccp-status').removeClass( 'unknown' ).addClass( 'good' ).find( '.status-text' ).html( "The NCCP Portal is <b>up</b>" );
            
            // Set the timestamp
            var now = new Date();
            $('#nccp-status').find( '.status-date' ).text( 'As of: ' + now.getHours() + ':' + now.getMinutes() );
        });
        
        // Then the API status
        get_server_status( 'data', function ( status ) {           
            if ( status.error )
                $('#data-status').removeClass( 'unknown' ).addClass( 'bad' ).find( '.status-text' ).html( "The Data API is <b>down</b>" );
            else if ( status.success )
                $('#data-status').removeClass( 'unknown' ).addClass( 'good' ).find( '.status-text' ).html( "The Data API is <b>up</b>" );

            
            // Set the timestamp
            var now = new Date();
            $('#data-status').find( '.status-date' ).text( 'As of: ' + now.getHours() + ':' + now.getMinutes() );
        });
        
        get_server_status( 'measurement', function ( status ) {           
            if ( status.error )
                $('#measurement-status').removeClass( 'unknown' ).addClass( 'bad' ).find( '.status-text' ).html( "The Measurement API is <b>down</b>" );
            else if ( status.success )
                $('#measurement-status').removeClass( 'unknown' ).addClass( 'good' ).find( '.status-text' ).html( "The Measurement API is <b>up</b>" );
    
            // Set the timestamp
            var now = new Date();
            $('#measurement-status').find( '.status-date' ).text( 'As of: ' + now.getHours() + ':' + now.getMinutes() );
        });
        
    }   

    // Get Data flow

    if ( page.find('#data-selectors').length ) {

        // Search sensor list for various properties
        page.find('#data-sensor-search').click(function () {
            // Build data query based on checked properties
            var query = {
                properties: [],
                sites: [],
                types: []
            };
            
            $('#data-selectors:visible .data-properties input:checked').each( function () {
                query.properties.push( $(this).val() ); 
            });
            
            $('#data-selectors:visible .data-sites input:checked').each( function () {
                query.sites.push( $(this).val() ); 
            });
            
            $('#data-selectors:visible .data-measurements-types input:checked').each( function () {
                query.types.push( $(this).val() );
            });
            
            // Send request to get applicable sensors
            $.getJSON( 'http://ec2-54-241-223-209.us-west-1.compute.amazonaws.com:6227/api/search?callback=?', { 
                properties: query.properties, 
                sites: query.sites,
                types: query.types,
                count: 20 
            }, function ( sensors ) { 
                if ( sensors.length ) {
                    // Construct sensor list
                    var sensor_list = build_sensor_list( sensors );
                    $('.data-sensor-search-results').append( sensor_list );

                    // Add get data button
                    $('.data-sensor-search-results').append( $( '<div/>', {
                        'data-role': 'controlgroup',
                        id: 'get-data-group'
                    }).append(
                        $( '<input/>', {
                            type: 'button',
                            'class': 'data-button',
                            name: 'data-get-sensor-data',
                            id: 'data-get-sensor-data',
                            value: 'Get Sensor Data',
                            'data-theme': 'a'
                        }),
                        $( '<input/>', {
                            type: 'button',
                            'class': 'data-button',
                            name: 'data-download-sensor-data',
                            id: 'data-download-sensor-data',
                            value: 'Download Sensor Data',
                            'data-theme': 'a'
                        })
                    ));                    

                    $('.data-sensor-search').fadeOut( 250, function () {
                        $('.sensor-search-results').trigger( 'create' );
                        page.find('#data-get-sensor-data').button();
                        page.find('#data-download-sensor-data').button();
                        page.find('#get-data-group').controlgroup();                        
                        $('.data-sensor-search-results').fadeIn( 250 );
                    });
                }
            });
            
        });

        // Retrieve sensor data for specific sensors
        page.on( 'click', '#data-get-sensor-data', function () {
            // Get the list of sensor IDs
            var sensor_ids = [];

            $('.sensor-search-results:visible input:checked').each( function () {
                sensor_ids.push( $(this).val() );
            });

            if ( sensor_ids.length ) {
                $.mobile.changePage( '/data-graphing', { data: { sensor_ids: sensor_ids }, type: 'GET' } );
            }
        });

        // Get CSV download of the sensor data
        page.on( 'click', '#data-download-sensor-data', function () {
            // Get the list of sensor IDs
            var sensor_ids = [];

            $('.sensor-search-results:visible input:checked').each( function () {
                sensor_ids.push( $(this).val() );
            });

            if ( sensor_ids.length ) {
                $.mobile.changePage( '/data-graphing', { data: { sensor_ids: sensor_ids, csv: true }, type: 'GET' } );
            }
        });
    }
      
});


////////////////////////////////////////////////////////////////////
// Functions ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function build_sensor_list ( sensors ) {
	var list = $( '<div/>', {
		'data-role': 'fieldcontain',
		'class': 'sensor-search-results'
	});
	var controlGroup = $( '<fieldset/>', {
		'data-role': 'controlgroup',
		'data-theme': 'a'
	});

	$.each( sensors, function () {
		controlGroup.append(
			$( '<label/>', {
				html: '<span>Interval: ' + this.interval + 'm' + '</span> ' + this.name
			}).prepend( $( '<input/>', {
				type: 'checkbox',
				value: this.logical_sensor_id,
			}))
		);
	});

	list.append( controlGroup );

	return list;
}

function get_server_status ( service, callback ) {
     
     // Build the request URL
     // First works in general
     // ... but the AWS version is best most of the time
     //var url = 'http://' + window.location.host + ':6227'; 
     var url = 'http://' + 'ec2-54-241-223-209.us-west-1.compute.amazonaws.com' + ':6227'; 
     
     switch ( service ) {
         case 'website': url += '/api/status/website?callback=?'; break;
         case 'data': url += '/api/status/services/data?callback=?'; break;
         case 'measurement': url += '/api/status/services/measurement?callback=?'; break;   
     }
     
     // Make the request
     $.getJSON( url, callback );
        
}

function get_sensor_data ( sensor_id, period, flot, callback ) {
    var options = { 'sensor_id' : sensor_id };
    
    if ( period )
        options.period = period;
        
    if ( flot )
        options.flot = true;
    
    $.post( '/data/index.php/api/get_sensor_data', options, function ( response ) { 
        callback( response ); 
    });
}
