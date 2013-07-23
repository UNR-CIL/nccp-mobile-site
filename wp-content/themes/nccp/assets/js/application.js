var App = Backbone.View.extend({

	attributes: {
		//DATA_SERVER	: "http://api.nccp.local:6227",
		DATA_SERVER 	: 'http://ec2-54-241-223-209.us-west-1.compute.amazonaws.com:6227'
	},

	// Initial view setup - load functions, jQuery UI setup, etc.
	initialize: function () {
		var $ = jQuery, // In case $.noConflict was called
			app = this;

		// Generic Setup //////////////////////////////////////////
		this.Thwomp();

		// Page setup /////////////////////////////////////////////

		// Home
		if ( $('.main-content.home').length ){
			this.RandomGraph();
		}		

		// Status page
		if ( $('.status').length ) {
			this.GetServerStatus();
		}

		// Data
		if ( $('.data-selectors').length ) {
			this.GetData();
		}

		// Graphs
		if ( $('.data-graphs').length ) {
			this.LoadGraphs();
		}
	},

	// EVENT BINDINGS //////////////////////////////////

	events: {
	},

	////////////////////////////////////////////////////
	// FUNCTIONS ///////////////////////////////////////
	////////////////////////////////////////////////////

	// Initialization functions ////////////////////////
	Thwomp: function () {
		$('.thwomp').click( function () {
			var parent = $(this);

			parent.next().stop().slideToggle( function () {
				parent.toggleClass( 'up' );
			});
		});
	},

	RandomGraph: function () {
		var app = this;

		$('.graph.random').each( function () {
			var sensor_id = Math.floor( Math.random() * 2104 ) + 1,
				now = new Date,
				then = new Date( ( now.getFullYear() - 1 ) + '-' + ( now.getMonth() + 1 ) + '-' + now.getDate() ),
				parent = this;

			$.getJSON( app.attributes.DATA_SERVER + '/api/get/?callback=?', { 
				sensor_ids: [sensor_id], 
				count: 500, 
				start: then.getFullYear() + '-' + ( then.getMonth() + 1 ) + '-' + then.getDate(),
				end: now.getFullYear() + '-' + ( now.getMonth() + 1 ) + '-' + now.getDate(),
				interval: 'hourly'
			}, function ( response ) {
				if ( response.num_results ) {
					// Then build graph in the new container
					app.Graphs.BuildLineGraph( response.sensor_data[sensor_id], '.graph.random', 0 );

					// Size the graph explicitly because some browsers size SVGs weirdly
					$( parent ).height( Math.floor( $(window).height() / 3 ) + 40 );	
				} else {
					// Size the graph explicitly because some browsers size SVGs weirdly
					$( parent ).height( 0 );
				}
				
			});
		});
	},

	GetServerStatus: function () {
		// Check the main server status
		this._GetServerStatus( 'website', function ( status ) {		   
			if ( status.error ) {
				$('#nccp-status').removeClass( 'unknown' ).addClass( 'bad' ).find( '.status-text' ).html( "The NCCP Portal is <b>down</b>" );
			} else if ( status.success ) {
				$('#nccp-status').removeClass( 'unknown' ).addClass( 'good' ).find( '.status-text' ).html( "The NCCP Portal is <b>up</b>" );
			}
			
			// Set the timestamp
			var now = new Date();
			$('#nccp-status').find( '.status-date' ).text( 'As of: ' + now.getHours() + ':' + now.getMinutes() );
		});
		
		// Then the API status
		this._GetServerStatus( 'data', function ( status ) {		   
			if ( status.error ) {
				$('#data-status').removeClass( 'unknown' ).addClass( 'bad' ).find( '.status-text' ).html( "The Data API is <b>down</b>" );
			} else if ( status.success ) {
				$('#data-status').removeClass( 'unknown' ).addClass( 'good' ).find( '.status-text' ).html( "The Data API is <b>up</b>" );
			}
			
			// Set the timestamp
			var now = new Date();
			$('#data-status').find( '.status-date' ).text( 'As of: ' + now.getHours() + ':' + now.getMinutes() );
		});
		
		this._GetServerStatus( 'measurement', function ( status ) {		   
			if ( status.error ) {
				$('#measurement-status').removeClass( 'unknown' ).addClass( 'bad' ).find( '.status-text' ).html( "The Measurement API is <b>down</b>" );
			} else if ( status.success ) {
				$('#measurement-status').removeClass( 'unknown' ).addClass( 'good' ).find( '.status-text' ).html( "The Measurement API is <b>up</b>" );
			}
	
			// Set the timestamp
			var now = new Date();
			$('#measurement-status').find( '.status-date' ).text( 'As of: ' + now.getHours() + ':' + now.getMinutes() );
		});
	},

	GetData: function () {
		var app = this;

		// Remove default checkboxes
		$(function () {
			$('input[type="checkbox"]').simpleCheckbox({
				newElementClass: 'checkbox',
				activeElementClass: 'checked'
			});
		});

		// Events ///////////////////////////////////////////////////////

		// Search sensor list for various properties
		$('#data-sensor-search').click( function () {
			// Build data query based on checked properties
			var query = {
				properties: [],
				sites: [],
				types: []
			};
			
			$('.data-selectors:visible .data-properties input:checked').each( function () {
				query.properties.push( $(this).val() );
			});
			
			$('.data-selectors:visible .data-sites input:checked').each( function () {
				query.sites.push( $(this).val() );
			});
			
			$('.data-selectors:visible .data-measurements-types input:checked').each( function () {
				query.types.push( $(this).val() );
			});
			
			// Send request to get applicable sensors
			$.getJSON( app.attributes.DATA_SERVER + '/api/search?callback=?', {
				properties: query.properties,
				sites: query.sites,
				types: query.types,
				count: 20
			}, function ( sensors ) {
				if ( sensors.length ) {
					// Save the sensor list to the global namespace for use elsewhere
					nccp.sensor_search_results = sensors;

					// Construct sensor list
					var sensor_list = app._BuildSensorList( sensors );
					$('.data-sensor-search-results .results').append( sensor_list );

					$('.data-sensor-search').fadeOut( 250, function () {
						$('.data-sensor-search-results, .data-filter-date-time, .data-view-options').fadeIn( 250 );

						// Bind date/time pickers
						$('#date-start, #date-end').datepicker({ autoclose: false });

						// Tag the datepickers so they can be styled separately
						$('#date-start').data( 'datepicker' ).picker.addClass( 'start' );
						$('#date-end').data( 'datepicker' ).picker.addClass( 'end' );

						var timepicker = $('#time').timepicker();
						timepicker.focus( function () {
							$(this).timepicker( 'showWidget' );
						});
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
							'class': 'data-button btn',
							id: 'data-reload-search',
							value: 'Try Again'
						})
					);

					$('.data-sensor-search').fadeOut( 250, function () {
						$('.data-sensor-search-results').fadeIn( 250 );

						$('#data-reload-search').click( function () {
							$('.data-sensor-search-results').fadeOut( 250, function () {
								$('.data-sensor-search-results').html( '' );
								$('.data-sensor-search').fadeIn( 250 );
							});
						});
					});					
				}
			});			
		});

		// View data table of sensor data
		$('#data-view-sensor-data').click( function () {
			// Get the list of sensor IDs
			var sensor_ids = [];

			$('.sensor-search-results:visible input:checked').each( function () {
				sensor_ids.push( $(this).val() );
			});

			if ( sensor_ids.length ) {
				app._GetSensorData( sensor_ids, false, function ( sensor_data ) {
					if ( sensor_data ) {
						var table_template = _.template( nccp.templates.data_table );

						$.each( sensor_data, function ( index ) {
							// Get sensor info from the last search results
							// What this is doing: 
							// Pull all the sensor_ids from the search results -->
							// Find the index of said sensor_id -->
							// Grab the sensor's object by the retrieved array index
							var sensor_info 	= nccp.sensor_search_results[ _.pluck( nccp.sensor_search_results, 'logical_sensor_id' ).indexOf( parseInt( index ) ) ];
								sensor_id 		= sensor_info.logical_sensor_id,
								sensor_name 	= sensor_info.name;

							$('.data-output .data-table').append( table_template({
								sensor: this,
								sensor_id: sensor_id,
								sensor_name: sensor_name
							}));
						});
					}
				});
			}
		});

		// Get CSV download of the sensor data
		$('#data-view-download').click( function () {
			// Get the list of sensor IDs
			var sensor_ids = [];

			$('.sensor-search-results:visible input:checked').each( function () {
				sensor_ids.push( $(this).val() );
			});

			if ( sensor_ids.length ) {
				app._GetSensorData( sensor_ids, true, function ( download_link ) {
					if ( download_link ) {
						app._ForceDownload( download_link );
					}
				});
			}
		});
	},

	LoadGraphs: function () {

	},

	// Functionality ///////////////////////////////////

	/////////////////////////////////////////////////////////////////
	// Internal functions ///////////////////////////////////////////
	/////////////////////////////////////////////////////////////////

	_BuildSensorList: function ( sensors ) {
		var list = $( '<div/>', {
			'class': 'sensor-search-results data-list'
		});
		var controlGroup = $( '<fieldset/>' );

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

		// Remove checkboxes
		list.find('input[type="checkbox"]').simpleCheckbox({
			newElementClass: 'checkbox',
			activeElementClass: 'checked'
		});

		return list;
	},

	_GetServerStatus: function ( service, callback ) {
		// Build the request URL	 
		switch ( service ) {
			case 'website': var url = this.attributes.DATA_SERVER + '/api/status/website?callback=?'; break;
			case 'data': var url = this.attributes.DATA_SERVER + '/api/status/services/data?callback=?'; break;
			case 'measurement': var url = this.attributes.DATA_SERVER + '/api/status/services/measurement?callback=?'; break;   
		}
		 
		// Make the request
		$.getJSON( url, callback );
	},

	_GetSensorData: function ( sensor_ids, csv, callback ) {
		var args = {
			sensor_ids: sensor_ids, 
			start: '2012-01-01', 
			end: '2012-02-01'
		};

		if ( csv ) args.csv = true;

		$.getJSON( this.attributes.DATA_SERVER + '/api/get?callback=?', args, function ( response ) {
			if ( csv ) {
				callback( response.download_link ? response.download_link : false );
			} else {
				callback( response.num_results > 0 ? response.sensor_data : false );
			}
			
		});
	},

	// Force download of CSV
	_ForceDownload: function ( url ) {
		var iframe = document.getElementById( 'hiddenDownloader' );

		if ( iframe === null ) {
			iframe = document.createElement( 'iframe' );  
			iframe.id = 'hiddenDownloader';
			iframe.style.display = 'none';
			document.body.appendChild( iframe );
		}
		
	    iframe.src = url; // Trigger the download
	},

	//////////////////////////////////////////////////////////
	// Graphing functions ////////////////////////////////////
	//////////////////////////////////////////////////////////

	Graphs: {
		colors: [
			'#016483',
			'#D92929',
			'#F2911B',
			'#F2CB05',
			'#6ECAC7'
		],

		BuildCombinedGraph: function ( data, parent ) {
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

			$.each( data, function ( i ) {
				g.append( "svg:path" )
					.attr( "d", line( this ) )
					.attr( "class", "line" )
					.style( "stroke", colorSwatch[ i % colorSwatch.length ] );
			});	

			// Append axis boundaries
			build_graph_axes( x, y, w, h, margin, g );
		},

		BuildLineGraph: function ( data, parent, index ) {
			// Graph width is calculated using window width because this is pretty much
			// the only thing that will ALWAYS return a consistent value
			var w = Math.floor( $(window).width() * 0.7 ),
				h = Math.floor( $(window).height() / 3 ),
				margin = 40,
				start = new Date( data[0].timestamp ),
				end = new Date( data[data.length - 1].timestamp ),
				y = d3.scale.linear().domain([d3.min(data, function ( d ) { return d.value; }), d3.max(data, function ( d ) { return d.value; })]).range([ 0 + margin, h - margin ]),
				x = d3.scale.linear().domain([ start, end ]).range([0 + margin, w - margin]);

			var g = d3.select( parent ).append("svg:g").attr("transform", "translate(0, " + h + ")");

			// Calculate the actual data line and append to the graph
			var line = d3.svg.line()
				.x( function( d, i ) { return x( new Date( d.timestamp ) ); })
				.y( function( d ) { return -1 * y( d.value ); });

			console.log( this );

			g.append( "svg:path" )
				.attr( "d", line( data ) )
				.attr( "class", "line" )
				.style( "stroke", this.colors[ index % this.colors.length ] );

			// Append axis boundaries
			this.BuildGraphAxes( x, y, w, h, margin, g );
		},

		BuildGraphAxes: function ( x, y, width, height, margin, graph ) {
			graph.append( "svg:line" )
				.attr( "class", "boundary" )
				.attr( "x1", margin )
				.attr( "y1", 0 )
				.attr( "x2", width - margin )
				.attr( "y2", 0 );

			graph.append( "svg:line" )
				.attr( "class", "boundary" )
				.attr( "x1", margin )
				.attr( "y1", -height )
				.attr( "x2", width - margin )
				.attr( "y2", -height );
			 
			graph.append( "svg:line" )
				.attr( "class", "boundary" )
				.attr( "x1", margin )
				.attr( "y1", 0 )
				.attr( "x2", margin )
				.attr( "y2", -height );

			graph.append("svg:line" )
				.attr( "class", "boundary" )
				.attr( "x1", width - margin )
				.attr( "y1", 0 )
				.attr( "x2", width - margin )
				.attr( "y2", -height );
			
			// Append tick labels
			graph.selectAll( ".xLabel" )
				.data( x.ticks( 5 ) )
				.enter().append( "svg:text" )
				.attr( "class", "xLabel" )
				.text( function ( v ) { 
					var date = new Date( v ); 
					return date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate() + ' ' + 
						date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
				})
				.attr( "x", function( d ) { return x( d ) })
				.attr( "y", 30 )
				.attr( "text-anchor", "middle" )

			graph.selectAll( ".xLines" )
				.data( x.ticks( 5 ) )
				.enter().append( "svg:line" )
				.attr( "class", "xLines" )
				.attr( "x1", function ( d ) { return x( d ); } )
				.attr( "y1", 0 )
				.attr( "x2", function ( d ) { return x( d ); } )
				.attr( "y2", -height );

			graph.selectAll( ".yLabel" )
				.data( y.ticks( 5 ) )
				.enter().append( "svg:text" )
				.attr( "class", "yLabel" )
				.text( function ( v ) { return parseFloat( v ); } )
				.attr( "x", 0 )
				.attr( "y", function( d ) { return -1 * y( d ) } )
				.attr( "text-anchor", "left" )
				.attr( "dy", 4 );

			graph.selectAll( ".yLines" )
				.data( y.ticks( 5 ) )
				.enter().append( "svg:line" )
				.attr( "class", "yLines" )
				.attr( "x1", margin )
				.attr( "y1", function( d ) { return -1 * y( d ) } )
				.attr( "x2", width - margin )
				.attr( "y2", function( d ) { return -1 * y( d ) } );
		}
	}

});

// Start the music

nccp.App = new App({ el: 'body' });