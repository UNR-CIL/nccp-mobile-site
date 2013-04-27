// Main javascript functionality (not including gmaps, which has a separate file)

// Create a global namespace for nccp objects
nccp = {};

// Global server config info //////////////////////////////////
nccp.config = {};
nccp.config.DATA_SERVER = "http://ec2-54-241-223-209.us-west-1.compute.amazonaws.com:6227";
//nccp.config.DATA_SERVER = 'http://nccp.local:6227';
nccp.config.DATA_API_BASE = nccp.config.DATA_SERVER + '/api/';

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
	
	// Get Server Status Page ///////////////////////////////
	
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

	// Get Data flow ////////////////////////////////////////

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
			$.getJSON( nccp.config.DATA_API_BASE + 'search?callback=?', { 
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
							name: 'data-graph-sensor-data',
							id: 'data-graph-sensor-data',
							value: 'Graph Sensor Data',
							'data-theme': 'a'
						}),
						$( '<input/>', {
							type: 'button',
							'class': 'data-button',
							name: 'data-view-sensor-data',
							id: 'data-view-sensor-data',
							value: 'View Sensor Data',
							'data-theme': 'a'
						}),
						$( '<input/>', {
							type: 'button',
							'class': 'data-button',
							name: 'data-download-sensor-data',
							id: 'data-download-sensor-data',
							value: 'Download Sensor Data CSV',
							'data-theme': 'a'
						})
					));					

					$('.data-sensor-search').fadeOut( 250, function () {
						$('.sensor-search-results').trigger( 'create' );
						page.find('#data-graph-sensor-data').button();
						page.find('#data-view-sensor-data').button();
						page.find('#data-download-sensor-data').button();
						page.find('#get-data-group').controlgroup();						
						$('.data-sensor-search-results').fadeIn( 250 );
					});
				} else {
					// Didn't find anything, so display error message
					$('.data-sensor-search-results').append( 
						$( '<h3/>', {
							'class': 'data-message',
							html: sensors.msg
						}),
						$( '<input/>', {
							type: 'button',
							'class': 'data-button',
							name: 'data-reload-search',
							id: 'data-reload-search',
							value: 'Try Again',
							'data-theme': 'a'
						})
					);

					$('.data-sensor-search').fadeOut( 250, function () {
						page.find('#data-reload-search').button();
						$('.data-sensor-search-results').fadeIn( 250 );

						page.find('#data-reload-search').click(function () {
							$('.data-sensor-search-results').fadeOut( 250, function () {
								$('.data-sensor-search-results').html( '' );
								$('.data-sensor-search').fadeIn( 250 );
							});
						});
					});					
				}
			});
			
		});

		// Retrieve sensor data for specific sensors
		page.on( 'click', '#data-graph-sensor-data', function () {
			// Get the list of sensor IDs
			var sensor_ids = [];

			$('.sensor-search-results:visible input:checked').each( function () {
				sensor_ids.push( $(this).val() );
			});

			if ( sensor_ids.length ) {
				nccp.sensor_ids = sensor_ids;
				$.mobile.changePage( '/data-graphing', { data: { sensor_ids: sensor_ids }, type: 'GET' } );
			}
		});

		// Get CSV download of the sensor data
		page.on( 'click', '#data-view-sensor-data', function () {
			// Get the list of sensor IDs
			var sensor_ids = [];

			$('.sensor-search-results:visible input:checked').each( function () {
				sensor_ids.push( $(this).val() );
			});

			if ( sensor_ids.length ) {
				nccp.sensor_ids = sensor_ids;
				$.mobile.changePage( '/data-table', { data: { sensor_ids: sensor_ids }, type: 'GET' } );
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
				nccp.sensor_ids = sensor_ids;
				$.mobile.changePage( '/data-table', { data: { sensor_ids: sensor_ids, csv: true }, type: 'GET' } );
			}
		});
	}

	// Graph Data ///////////////////////////////////////////

	if ( page.find('#data-graphs').length ) {
		// If sensor_ids were passed, get the sensor data for the sensors
		if ( nccp.sensor_ids ) {
			$.getJSON( nccp.config.DATA_API_BASE + 'get/?callback=?', { 
				sensor_ids: nccp.sensor_ids, 
				count: 1000, 
				start: '2012-01-01',
				end: '2013-01-01',
				interval: 'hourly' 
			}, function ( response ) {
				nccp.sensor_data = response.sensor_data;

				$.each( response.sensor_data, function ( sensor_id ) {
					
					// Then build graph in the new container
					build_line_graph( response.sensor_data[sensor_id], "#graph-" + sensor_id );

					// Size the graph explicitly because some browsers size SVGs weirdly
					$("#graph-" + sensor_id).height( Math.floor( $(window).height() / 3 ) + 40 );

				});

				// Show combined graph on command
				$('#data-show-combined').click( function () {
					build_combined_graph( nccp.sensor_data, "#graph-combined" );
					$("#graph-combined").height( Math.floor( $(window).height() / 3 ) + 40 );

					$('.graph:not(.combined), #data-show-combined').fadeOut( 250, function () {
						$('.graph.combined, #data-show-individual').fadeIn( 250 );
					});
				});
			}); 
		}

		// Test graph data
		//var data = {"num_results":10,"sensor_data":{"19":[{"logical_sensor_id":19,"timestamp":"2012-01-01T08:00:00.000Z","value":92159.86},{"logical_sensor_id":19,"timestamp":"2012-01-01T09:00:00.000Z","value":92186.39},{"logical_sensor_id":19,"timestamp":"2012-01-01T10:00:00.000Z","value":92201.79},{"logical_sensor_id":19,"timestamp":"2012-01-01T11:00:00.000Z","value":92227.31},{"logical_sensor_id":19,"timestamp":"2012-01-01T12:00:00.000Z","value":92234.9}],"84":[{"logical_sensor_id":84,"timestamp":"2012-01-01T08:00:00.000Z","value":92160.27},{"logical_sensor_id":84,"timestamp":"2012-01-01T09:00:00.000Z","value":92183.72},{"logical_sensor_id":84,"timestamp":"2012-01-01T10:00:00.000Z","value":92199.3},{"logical_sensor_id":84,"timestamp":"2012-01-01T11:00:00.000Z","value":92230.6},{"logical_sensor_id":84,"timestamp":"2012-01-01T12:00:00.000Z","value":92234.92}]}};
		//var data = data.sensor_data['19'];
		//build_line_graph( data );

	}
	  
});

////////////////////////////////////////////////////////////////////
// Functions ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

// Same as build_line_graph, but combined
function build_combined_graph( data, parent ) {
	// Base the scale off the first set of data
	var first = data[ Object.keys( data )[ 0 ] ];

	// Figure out who has the min and max values
	var min = d3.min( first, function ( d ) { return d.value; } ),
		max = d3.max( first, function ( d ) { return d.value; } )

	$.each( data, function () {
		var thisMin = d3.min( this, function ( d ) { return d.value; } ),
			thisMax = d3.max( this, function ( d ) { return d.value; } )

		if ( thisMin < min ) min = thisMin;
		if ( thisMax > max ) max = thisMax;
	});

	// Graph width is calculated using window width because this is pretty much
	// the only thing that will ALWAYS return a consistent value
	var w = Math.floor( $(window).width() * 0.7 ),
		h = Math.floor( $(window).height() / 3 ),
		margin = 40,
		start = new Date( first[0].timestamp ),
		end = new Date( first[first.length - 1].timestamp ),
		y = d3.scale.linear().domain([ min, max ]).range([0 + margin, h - margin]),
		x = d3.scale.linear().domain([ start, end ]).range([0 + margin, w - margin]);

	var g = d3.select( parent ).append("svg:g").attr("transform", "translate(0, " + h + ")");

	// Calculate the actual data line and append to the graph
	var line = d3.svg.line()
		.x( function( d, i ) { return x( new Date( d.timestamp ) ); })
		.y( function( d ) { return -1 * y( d.value ); });

	$.each( data, function () {
		g.append( "svg:path" )
			.attr( "d", line( this ) )
			.attr( "class", "line" );
	});	

	// Append axis boundaries
	g.append( "svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", 0 )
		.attr( "x2", w - margin )
		.attr( "y2", 0 );

	g.append( "svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", -h )
		.attr( "x2", w - margin )
		.attr( "y2", -h );
	 
	g.append("svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", 0 )
		.attr( "x2", margin )
		.attr( "y2", -h );

	g.append("svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", w - margin )
		.attr( "y1", 0 )
		.attr( "x2", w - margin )
		.attr( "y2", -h );
	
	// Append tick labels
	g.selectAll( ".xLabel" )
		.data( x.ticks( 5 ) )
		.enter().append( "svg:text" )
		.attr( "class", "xLabel" )
		.text( function ( v ) { 
			var date = new Date( v ); 
			return date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate() + ' ' + 
				date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
		})
		.attr( "x", function(d) { return x(d) })
		.attr( "y", 20 )
		.attr( "text-anchor", "middle" )

	g.selectAll( ".xLines" )
		.data( x.ticks( 5 ) )
		.enter().append( "svg:line" )
		.attr( "class", "xLines" )
		.attr( "x1", function ( d ) { return x( d ); } )
		.attr( "y1", 0 )
		.attr( "x2", function ( d ) { return x( d ); } )
		.attr( "y2", -h );

	g.selectAll( ".yLabel" )
		.data( y.ticks( 5 ) )
		.enter().append( "svg:text" )
		.attr( "class", "yLabel" )
		.text( function ( v ) { return parseFloat( v ); } )
		.attr( "x", 0 )
		.attr( "y", function(d) { return -1 * y(d) } )
		.attr( "text-anchor", "right" )
		.attr( "dy", 4 );

	g.selectAll( ".yLines" )
		.data( y.ticks( 5 ) )
		.enter().append( "svg:line" )
		.attr( "class", "yLines" )
		.attr( "x1", margin )
		.attr( "y1", function(d) { return -1 * y(d) } )
		.attr( "x2", w - margin )
		.attr( "y2", function(d) { return -1 * y(d) } );
}

function build_line_graph( data, parent ) {
	// Graph width is calculated using window width because this is pretty much
	// the only thing that will ALWAYS return a consistent value
	var w = Math.floor( $(window).width() * 0.7 ),
		h = Math.floor( $(window).height() / 3 ),
		margin = 40,
		start = new Date( data[0].timestamp ),
		end = new Date( data[data.length - 1].timestamp ),
		y = d3.scale.linear().domain([d3.min(data, function ( d ) { return d.value; }), d3.max(data, function ( d ) { return d.value; })]).range([0 + margin, h - margin]),
		x = d3.scale.linear().domain([ start, end ]).range([0 + margin, w - margin]);

	var g = d3.select( parent ).append("svg:g").attr("transform", "translate(0, " + h + ")");

	// Calculate the actual data line and append to the graph
	var line = d3.svg.line()
		.x( function( d, i ) { return x( new Date( d.timestamp ) ); })
		.y( function( d ) { return -1 * y( d.value ); });

	g.append( "svg:path" )
		.attr( "d", line( data ) )
		.attr( "class", "line" );

	// Append axis boundaries
	g.append( "svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", 0 )
		.attr( "x2", w - margin )
		.attr( "y2", 0 );

	g.append( "svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", -h )
		.attr( "x2", w - margin )
		.attr( "y2", -h );
	 
	g.append("svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", margin )
		.attr( "y1", 0 )
		.attr( "x2", margin )
		.attr( "y2", -h );

	g.append("svg:line" )
		.attr( "class", "boundary" )
		.attr( "x1", w - margin )
		.attr( "y1", 0 )
		.attr( "x2", w - margin )
		.attr( "y2", -h );
	
	// Append tick labels
	g.selectAll( ".xLabel" )
		.data( x.ticks( 5 ) )
		.enter().append( "svg:text" )
		.attr( "class", "xLabel" )
		.text( function ( v ) { 
			var date = new Date( v ); 
			return date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate() + ' ' + 
				date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
		})
		.attr( "x", function(d) { return x(d) })
		.attr( "y", 20 )
		.attr( "text-anchor", "middle" )

	g.selectAll( ".xLines" )
		.data( x.ticks( 5 ) )
		.enter().append( "svg:line" )
		.attr( "class", "xLines" )
		.attr( "x1", function ( d ) { return x( d ); } )
		.attr( "y1", 0 )
		.attr( "x2", function ( d ) { return x( d ); } )
		.attr( "y2", -h );

	g.selectAll( ".yLabel" )
		.data( y.ticks( 5 ) )
		.enter().append( "svg:text" )
		.attr( "class", "yLabel" )
		.text( function ( v ) { return parseFloat( v ); } )
		.attr( "x", 0 )
		.attr( "y", function(d) { return -1 * y(d) } )
		.attr( "text-anchor", "right" )
		.attr( "dy", 4 );

	g.selectAll( ".yLines" )
		.data( y.ticks( 5 ) )
		.enter().append( "svg:line" )
		.attr( "class", "yLines" )
		.attr( "x1", margin )
		.attr( "y1", function(d) { return -1 * y(d) } )
		.attr( "x2", w - margin )
		.attr( "y2", function(d) { return -1 * y(d) } );
}

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
	 switch ( service ) {
		 case 'website': var url = nccp.config.DATA_API_BASE + 'status/website?callback=?'; break;
		 case 'data': var url = nccp.config.DATA_API_BASE + 'status/services/data?callback=?'; break;
		 case 'measurement': var url = nccp.config.DATA_API_BASE + 'status/services/measurement?callback=?'; break;   
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
