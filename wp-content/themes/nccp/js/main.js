// Main javascript functionality


$(function () {
    
    // Menu

    $('#main-navigation').on( 'mouseover', '#menu-main-navigation > li > a', function () {       
        var parent = $(this).parent('li');
        var siblings = parent.siblings('li');
            
        siblings.find('ul.sub-menu').hide();
        parent.find('ul.sub-menu').stop().fadeTo( 500, 1 );
        parent.siblings('li').removeClass('active');
    });
    
    // Flots
    
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
