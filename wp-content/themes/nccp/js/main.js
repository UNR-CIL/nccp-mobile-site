// Main javascript functionality (not including gmaps, which has a separate file)

// The normal jquery init event will only be fired on initial page load, not AJAX loads
// This means control events should be bound here because they're bound in pageinit they'll be
// bound with EVERY pageload instead of only once
$( function () {
    
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
    
    // Menu

    /*page.find('#main-navigation').on( 'mouseover', '#menu-main-navigation > li > a', function () {       
        var parent = $(this).parent('li');
        var siblings = parent.siblings('li');
            
        siblings.find('ul.sub-menu').hide();
        parent.find('ul.sub-menu').stop().fadeTo( 500, 1 );
        parent.siblings('li').removeClass('active');
    });*/
    
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
      
});


////////////////////////////////////////////////////////////////////
// Functions ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

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
