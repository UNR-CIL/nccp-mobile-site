var App = Backbone.View.extend({

	attributes: {
		//DATA_SERVER	: "http://api.nccp.local:6227",
		DATA_SERVER 	: 'http://ec2-54-241-223-209.us-west-1.compute.amazonaws.com:6227'
	},

	// Initial view setup - load functions, jQuery UI setup, etc.
	initialize: function () {
		var $ = jQuery, // In case $.noConflict was called
			app = this;

		// Ensure every child fn of the view has a reference to the parent
		_.each( this.__proto__, function( fn ) { fn.app = app; } );

		// Generic Setup //////////////////////////////////////////
		this.Thwomp();

		// Page setup /////////////////////////////////////////////

		// Home
		if ( $('.main-content.home').length ){
			this.RandomGraph();
		}		

		// Status page
		if ( $('.status').length ) {
			this.GetStatus();
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

	GetStatus: function () {
		// Check the main server status
		this.__.GetServerStatus( 'website', function ( status ) {		   
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
		this.__.GetServerStatus( 'data', function ( status ) {		   
			if ( status.error ) {
				$('#data-status').removeClass( 'unknown' ).addClass( 'bad' ).find( '.status-text' ).html( "The Data API is <b>down</b>" );
			} else if ( status.success ) {
				$('#data-status').removeClass( 'unknown' ).addClass( 'good' ).find( '.status-text' ).html( "The Data API is <b>up</b>" );
			}
			
			// Set the timestamp
			var now = new Date();
			$('#data-status').find( '.status-date' ).text( 'As of: ' + now.getHours() + ':' + now.getMinutes() );
		});
		
		this.__.GetServerStatus( 'measurement', function ( status ) {		   
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
					var sensor_list = app.__.BuildSensorList( sensors );
					$('.data-sensor-search-results .results').append( sensor_list );

					$('.data-selectors').fadeOut( 250, function () {
						// Fade in results and filtering options
						$('.data-sensor-search-results, .data-filter-date-time, .data-filter-time-interval, .data-view-options').fadeIn( 250 );

						// Bind events for choosing date/time filtering
						$('#data-filter-date').click( function () {
							$('.filter-date').slideToggle();
						});

						$('#data-filter-time').click( function () {
							$('.filter-time').slideToggle();
						});

						// Bind date/time pickers
						$('#date-start, #date-end').datepicker({ 
							autoclose: false,
							template: 'modal'
						});
						$('#date-start').datepicker().on( 'changeDate', function( e ) {
							$('#date-start').text( $('#date-start').data('date') );
						});
						$('#date-end').datepicker().on( 'changeDate', function( e ) {
							$('#date-end').text( $('#date-end').data('date') );
						});

						// Tag the datepickers so they can be styled separately
						$('#date-start').data( 'datepicker' ).picker.addClass( 'start' );
						$('#date-end').data( 'datepicker' ).picker.addClass( 'end' );

						var timepicker = $('#time').timepicker({
							defaultTime: '00:00',
							showMeridian: false,
							template: 'modal',
							modalBackdrop: true
						});
						$('.bootstrap-timepicker-widget').removeClass( 'hide' );
						timepicker.click( function () {							
							$(this).timepicker( 'showWidget' );							
						});
						timepicker.timepicker().on('changeTime.timepicker', function(e) {
							timepicker.text( e.time.value );
						});

						// Hook up interval picking
						$( '#data-filter-interval-modal' ).on( 'show.bs.modal', function () {
							var active = _.filter( $('#data-filter-interval-modal a'), function ( element ) {
								return $(element).text() == $('#interval-picker-trigger').text();
							});

							$('#data-filter-interval-modal .active').removeClass( 'active' );
							$(active).addClass( 'active' );
						});
						$('#data-filter-interval-modal a').click( function ( event ) {
							event.preventDefault();

							$('#interval-picker-trigger').text( $(this).text() );
							$('#data-filter-interval-modal .active').removeClass( 'active' );
							$(this).addClass( 'active' );
							$('#data-filter-interval-modal').modal( 'hide' );
						});

						// Link up the reset button
						$('#data-sensor-search-reset').click( function () {
							app.__.ResetDataSearch();
						});
						$('.data-search-reset').fadeIn( 250 );
					});
				} else {
					// Didn't find anything, so display error message
					$('.data-sensor-search-results').append(
						$( '<h3/>', {
							'class': 'data-message error',
							html: 'No results found.'
						}),
						$( '<input/>', {
							type: 'button',
							'class': 'data-button btn',
							id: 'data-reload-search',
							value: 'Try Again'
						})
					);

					$('.data-selectors').fadeOut( 250, function () {
						$('.data-sensor-search-results').fadeIn( 250 );

						$('#data-reload-search').click( function () {
							$('.data-sensor-search-results').fadeOut( 250, function () {
								$('.data-sensor-search-results').html( '' );
								$('.data-selectors').fadeIn( 250 );
							});
						});
					});					
				}
			});			
		});

		// View data table of sensor data
		$('#data-view-sensor-data').click( function () {
			// Collect sensor info			
			var args = app.__.GetSensorInfo();

			if ( args.sensor_ids.length && args.start && args.end ) {
				// Throw up loading animation
				if ( ! $('.main-content .loading').length ) $('.main-content').append( nccp.templates.loading );

				app.__.GetSensorData( args, false, function ( sensor_data, msg ) {
					if ( sensor_data ) {
						var table_template = _.template( nccp.templates.data_table );

						// Clear any errors
						$('.data-view-options').find( '.error' ).fadeOut( 250, function () {
							$('.data-view-options').find( '.error' ).hide();
						});

						// Clear out the loading message
						$('.main-content .loading').remove();

						$.each( sensor_data, function ( index ) {
							// Get sensor info from the last search results
							// What this is doing: 
							// Pull all the sensor_ids from the search results -->
							// Find the index of said sensor_id -->
							// Grab the sensor's object by the retrieved array index
							var sensor_info 	= nccp.sensor_search_results[ _.pluck( nccp.sensor_search_results, 'logical_sensor_id' ).indexOf( parseInt( index ) ) ];
								sensor_id 		= sensor_info.logical_sensor_id,
								sensor_name 	= sensor_info.name;

							$('.data-output .data-tables').append( table_template({
								sensor: this,
								sensor_id: sensor_id,
								sensor_name: sensor_name
							}));
						});

						// Hide all the search stuff
						$('.form-element').hide();
					}

					if ( msg ) {
						app.__.ThrowError( $('.data-view-options'), msg );
					}
				});
			} else {
				app.__.ThrowError( $('.data-view-options'), 'Please select at least one sensor.' );
			}
		});

		// Get CSV download of the sensor data
		$('#data-view-download').click( function () {
			// Collect sensor info			
			var args = app.__.GetSensorInfo();

			if ( args.sensor_ids.length && args.start && args.end ) {
				app.__.GetSensorData( sensor_ids, true, function ( download_link ) {
					if ( download_link ) {
						app.__.ForceDownload( download_link );
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

	__: {
		GetSensorInfo: function () {
			var args = {
					sensor_ids: [],
					start: null,
					end: null,
					interval: 'hourly'
				};

			// Collect selected sensors
			$('.sensor-search-results:visible input:checked').each( function () {
				args.sensor_ids.push( $(this).val() );
			});

			// Grab time/date
			var start = new Date( $('#date-start').text() ),
				end = new Date( $('#date-end').text() );

			// Dates
			args.start = start.getFullYear() + '-' + ( start.getMonth() + 1 ) + '-' + start.getDate();
			args.end = end.getFullYear() + '-' + ( end.getMonth() + 1 ) + '-' + end.getDate();

			// Time
			var time = $('#time').data('timepicker');
			args.start += ' ' + time.hour + ':' + time.minute + ':' + '00';
			args.end += ' ' + time.hour + ':' + time.minute + ':' + '00';

			// Grab interval
			var interval = $('#interval-picker-trigger').text().toLowerCase();
			args.interval = interval == 'per minute' ? null : interval;

			return args;
		},

		BuildSensorList: function ( sensors ) {
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

		GetServerStatus: function ( service, callback ) {
			// Build the request URL	 
			switch ( service ) {
				case 'website': var url = this.attributes.DATA_SERVER + '/api/status/website?callback=?'; break;
				case 'data': var url = this.attributes.DATA_SERVER + '/api/status/services/data?callback=?'; break;
				case 'measurement': var url = this.attributes.DATA_SERVER + '/api/status/services/measurement?callback=?'; break;   
			}
			 
			// Make the request
			$.getJSON( url, callback );
		},

		GetSensorData: function ( args, csv, callback ) {
			var app = this.app;

			if ( csv ) args.csv = true;

			$.getJSON( app.attributes.DATA_SERVER + '/api/get?callback=?', args, function ( response ) {
				if ( csv ) {
					callback( response.download_link ? response.download_link : false );
				} else {
					if ( response.num_results > 0 ) {
						callback( response.sensor_data );
					} else {
						callback( null, response.msg );
					}					
				}			
			});
		},

		ResetDataSearch: function () {
			$('.form-element').not('.data-selectors').hide();
			$('.data-output .data-tables, .data-output .data-graphs, .data-sensor-search-results .results').empty();
			$('.data-search-reset').hide();

			$('.data-selectors').fadeIn( 250 );	
		},

		// Force download of CSV
		ForceDownload: function ( url ) {
			var iframe = document.getElementById( 'hiddenDownloader' );

			if ( iframe === null ) {
				iframe = document.createElement( 'iframe' );  
				iframe.id = 'hiddenDownloader';
				iframe.style.display = 'none';
				document.body.appendChild( iframe );
			}
			
			iframe.src = url; // Trigger the download
		},

		ThrowError: function ( parent, error, type ) {
			var type = ( type || 'error' );

			if( ! $(parent).find( '.error' ).length ) {
				$(parent).append( $('<div/>', { 'class': type }) );
			} 

			$(parent).find( '.error' ).fadeOut( 250, function () {
				$(parent).find( '.error' ).html( error ).fadeIn( 250 );
			});
		}
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