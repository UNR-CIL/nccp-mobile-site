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

});

// This stuff will fire on every page load, AJAX or otherwise
$(document).bind( 'pageinit', function () {

    // Find the parent page - this will change as pages are loaded dynamically and you
    // can't reliably use the widget selectors because they won't have gone through yet by the
    // time pageinit fires.  All parent selectors should be namespaced by this (i.e. page.find( blah ) 
    // instead of $( blah ))
    var page = ( $('#page[data-external-page="true"]').length ) ? $('#page[data-external-page="true"]') : $('#page');
    
    // Menu

    page.find('#main-navigation').on( 'mouseover', '#menu-main-navigation > li > a', function () {       
        var parent = $(this).parent('li');
        var siblings = parent.siblings('li');
            
        siblings.find('ul.sub-menu').hide();
        parent.find('ul.sub-menu').stop().fadeTo( 500, 1 );
        parent.siblings('li').removeClass('active');
    });
    
    // Flots
    
    if ( $('.flot').length ) {
        get_sensor_data( 7, 'day', true, function ( response ) { 
            var options = {
                xaxis : {
                    mode: "time", 
                    minTickSize: [ 1, "day" ]    
                },
                zoom : {
                    interactive: true    
                },
                pan : {
                    interactive: true    
                },
                crosshair : {
                    mode: "x"    
                },
                series: {
                    color: '#DB5C1F'    
                }        
            }
            
            $.plot( $("#flot-1"), [$.parseJSON(response)], options );     
        });
        
        get_sensor_data( 5, 'hour', true, function ( response ) { 
            var options = {
                xaxis : {
                    mode: "time", 
                    minTickSize: [ 1, "hour" ]                    
                },
                zoom : {
                    interactive: true    
                },
                pan : {
                    interactive: true    
                },
                crosshair : {
                    mode: "x"    
                },
                series : {
                    color: '#297fd0',
                    bars: { show: true }    
                }        
            }
            
            $.plot( $("#flot-2"), [$.parseJSON(response)], options );     
        }); 
        
        get_sensor_data( 4, 'minute', true, function ( response ) { 
            var options = {
                xaxis : {
                    mode: "time", 
                    minTickSize: [ 1, "minute" ]    
                },
                zoom : {
                    interactive: true    
                },
                pan : {
                    interactive: true    
                },
                crosshair : {
                    mode: "x"    
                },
                series : {
                    color: '#5ab71c'    
                }        
            }
            
            $.plot( $("#flot-3"), [$.parseJSON(response)], options );     
        });    
    }    
      
});


////////////////////////////////////////////////////////////////////
// Functions ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

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
