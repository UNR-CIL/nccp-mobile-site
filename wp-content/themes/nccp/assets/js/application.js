var App = Backbone.View.extend({

	attributes: {
		//DATA_SERVER	: "http://nccp-api.dev:6227",
		DATA_SERVER 	: 'http://ec2-54-241-223-209.us-west-1.compute.amazonaws.com:6227'
	},

	// Initial view setup - load functions, jQuery UI setup, etc.
	initialize: function () {
		var $ = jQuery, // In case $.noConflict was called
			app = this;

		// Extend a reference to the parent app into every child object
		$.each( this, function () { $.extend( this, app ) });

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
					// Save sensor result info for use later - GetSensorMeta can be called to get more detailed info if needed
					nccp.sensor_search_results = sensors;
					
					// Construct sensor list
					var sensor_list = app.__.BuildSensorList( sensors );
					$('.data-sensor-search-results .results').append( sensor_list );

					$('.data-selectors').fadeOut( 250, function () {
						// Bind events, but only if they haven't been bound already
						if ( ! nccp.form_reset ) {
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
						}						

						// Show everything
						$('.data-sensor-search-results, .data-filter-date-time, .data-filter-time-interval, .data-view-options').fadeIn( 250 );
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
				// Throw up loading animation before starting
				app.__.ShowLoading( $('.main-content') );

				app.__.GetSensorData( args, false, function ( sensor_data, msg ) {
					if ( sensor_data ) {
						var table_template = _.template( nccp.templates.data_table );

						// Clear any errors
						$('.data-view-options').find( '.error' ).fadeOut( 250, function () {
							$('.data-view-options').find( '.error' ).hide();
						});

						// Clear out the loading message
						app.__.RemoveLoading( $('.main-content') );

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
				// Throw up loading animation before starting
				app.__.ShowLoading( $('.main-content') );

				app.__.GetSensorData( args, true, function ( download_link, msg ) {
					app.__.RemoveLoading( $('.main-content') );

					if ( download_link ) {
						app.__.ForceDownload( download_link );
					} else {
						app.__.ThrowError( $('.main-content'), msg );
					}
				});
			} else {
				app.__.ThrowError( $('.data-view-options'), 'Please select at least one sensor.' );
			}
		});

		// Graph sensor data
		$('#data-view-graph').click( function () {
			// Display available graph types
			$('.data-graph-types').fadeIn( 250, function () {
				// Bind graphing event handling
				$('#data-get-graphs').click( function ( event ) {
					event.preventDefault();

					// Get the chart types to produce + sensors to chart
					var types = _.map( $('.data-graph-types input:checked'), function ( el ) { return $(el).val(); } ),
						args = app.__.GetSensorInfo();

					// Throw appropriate errors if both are empty
					if ( ! args.sensor_ids.length ) {
						app.__.ThrowError( $('.data-view-options'), 'Please select at least one sensor.' );
						return false;
					}
					if ( ! args.start || ! args.end ) {
						app.__.ThrowError( $('.data-view-options'), 'Please select a valid start and end period.' );
						return false;
					}
					if ( ! types.length ) {
						app.__.ThrowError( $('.data-view-options'), 'Please select at least one graph type.' );
						return false;
					}

					// If everything is cool, send the graph request
					app.Graphs.BuildGraphs( args, types );
				});
			});
		});
	},

	// Functionality ///////////////////////////////////

	/////////////////////////////////////////////////////////////////
	// Internal functions ///////////////////////////////////////////
	/////////////////////////////////////////////////////////////////

	__: {
		// Retrieve meta info about array of sensors (units, deployment, etc.)
		GetSensorMeta: function ( sensors, callback ) {
			if ( sensors.length ) {
				$.getJSON( this.app.attributes.DATA_SERVER + '/api/get/sensor-info?callback=?', { sensor_ids: sensors }, function ( meta ) {
					if ( meta.msg ) {
						callback( null, meta.msg );
					} else {
						callback( meta, null );
					}
				});
			}
		},

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
					if ( response.download_link ) {
						callback( response.download_link, null );
					} else {
						callback( null, response.msg );
					}
					
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

			// Keep track of the fact that the form was reset so we don't bind events twice
			nccp.form_reset = true;
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
		},

		// Throw up loading animation
		ShowLoading: function ( container ) {
			if ( ! $(container).find('.loading').length ) $(container).append( nccp.templates.loading );
		},

		RemoveLoading: function ( container ) {
			$(container).find('.loading').remove();
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

		BuildGraphs: function ( args, types ) {
			var app = this;

			// Throw up loading animation before starting
			app.__.ShowLoading( $('.main-content') );

			// Fetch meta info about the sensor
			app.__.GetSensorMeta( args.sensor_ids, function ( meta, msg ) {				
				// Then fetch the sensor data itself
				app.__.GetSensorData( args, false, function ( sensor_data, msg ) {
					if ( sensor_data ) {
						// Clear any errors
						$('.data-view-options').find( '.error' ).fadeOut( 250, function () {
							$('.data-view-options').find( '.error' ).hide();
						});

						// Clear out the loading message
						app.__.RemoveLoading( $('.main-content') );

						// Format the data for inserting into combined graph
						var formatted = [],
							count = 0;

						$.each( sensor_data, function ( index ) {
							// Collect the sensor from the retrieved meta info 
							var sensor_info = meta[ index ];

							// Then figure out what data precision to display.  The database will not return a standard precision so
							// this has to be established before graphing.  Use only a sample of the data set because the set may be
							// large (>100k).
							var sample = this.slice(0, 100),
								max_precision = _.max( sample, function ( num ) { var val = num.value.toString().split( '.' ); return val.length > 1 ? val[1].length : 0; } ),
								max_split = max_precision.value.toString().split('.'),
								precision = max_split.length > 1 ? max_split[1].length : 0;

							formatted.push({
								values: _.map( this, function ( num, i ) { return { x: new Date( num.timestamp ), y: num.value }; } ),
								key: sensor_info.property_name + ' - ' + sensor_info.type_name,
								color: app.colors[ count ],
								yLabel: sensor_info.abbreviation + ' (' + sensor_info.unit_name + ')',
								precision: precision
							});

							count++;
						});
						
						// Build the graphs with the formatted data
						$.each( types, function () {
							// Append a graph element for the graph
							d3.select('.data-graphs').append('svg')
								.attr( 'class', this + ' graph' )
								.style({ 'height': 500 });

							// Build the resulting graphs - note that the Y label is taken from the first returned sensor
							switch ( this.toString() ) {
								case 'line': 	app.BuildNVLineGraph( formatted, '.data-graphs svg.line', 'Time', formatted[0].yLabel ); 		break;
								case 'bar': 	app.BuildNVBarGraph( formatted, '.data-graphs svg.bar', 'Time', formatted[0].yLabel ); 			break;
								case 'scatter': app.BuildNVScatterGraph( formatted, '.data-graphs svg.scatter', 'Time', formatted[0].yLabel ); 	break;
								case 'stacked': app.BuildNVStackedArea( formatted, '.data-graphs svg.stacked', 'Time', formatted[0].yLabel ); 	break;
							}
						});

						// Hide all the search stuff
						$('.form-element').hide();
					} else {
						app.__.ThrowError( $('.main-content'), msg );
					}
				});
			});
		},

		BuildNVLineGraph: function ( data, container, xLabel, yLabel ) {
			var graphs = this;

			nv.addGraph( function () {  
				var chart = nv.models.lineChart();

				chart.margin({ top: 50, right: 50, bottom: 50, left: 75 });
			 
				chart.xAxis
					.axisLabel( xLabel )
					.tickFormat( graphs.FormatGraphDate );
			 
				chart.yAxis
					.axisLabel( yLabel )
					.tickFormat( d3.format( '.0' + data.precision + 'f' ) );

				d3.select( container )
					.datum( data )
					.transition().duration( 500 )
					.call( chart );
			 
				nv.utils.windowResize( function () { d3.select( container ).call( chart ) });
			 
				return chart;
			});
		},

		BuildNVBarGraph: function ( data, container, xLabel, yLabel ) {
			var graphs = this;

			nv.addGraph( function () {
				var chart = nv.models.multiBarChart();

				chart.margin({ top: 50, right: 50, bottom: 50, left: 75 });

				chart.xAxis
					.axisLabel( xLabel )
					.tickFormat( graphs.FormatGraphDate );

				chart.yAxis
					.axisLabel( yLabel )
					.tickFormat( d3.format( '.0' + data.precision + 'f' ) );

				d3.select( container )
					.datum( data )
					.transition().duration( 500 )
					.call( chart );

				nv.utils.windowResize( chart.update );

				return chart;
			});
		},

		BuildNVScatterGraph: function ( data, container, xLabel, yLabel ) {
			var graphs = this;

			nv.addGraph(function() {
				var chart = nv.models.scatterChart()
					.showDistX( true )
					.showDistY( true )
					.color( d3.scale.category10().range() );

				chart.margin({ top: 50, right: 50, bottom: 50, left: 75 });

				chart.xAxis
					.axisLabel( xLabel )
					.tickFormat( graphs.FormatGraphDate );

				chart.yAxis
					.axisLabel( yLabel )
					.tickFormat( d3.format( '.0' + data.precision + 'f' ) )

				d3.select( container )
					.datum( data )
					.transition().duration( 500 )
					.call( chart );

				nv.utils.windowResize( chart.update );

				return chart;
			});
		},

		BuildNVStackedArea: function ( data, container, xLabel, yLabel ) {
			var graphs = this;

			// Stacked area requires each subarray have the same length, so we have to find the min
			// and splice out any elements longer than that from the others
			var min = _.min( data, function ( sensor ) { return sensor.values.length; } );
			$.each( data, function () { 
				if ( this.values.length > min.values.length ) {
					this.values.splice( min.values.length, this.values.length - min.values.length );
				} 
			});

			nv.addGraph(function() {
				var chart = nv.models.stackedAreaChart()
					.x( function( d ) { return d.x; } )
					.y( function( d ) { return d.y; } )
					.clipEdge(true);

				chart.margin({ top: 50, right: 50, bottom: 50, left: 75 });
 
				chart.xAxis
					.axisLabel( xLabel )
					.tickFormat( graphs.FormatGraphDate );
 
				chart.yAxis
					.axisLabel( yLabel )
					.tickFormat( d3.format( '.0' + data.precision + 'f' ) );
 
				d3.select( container )
					.datum( data )
					.transition().duration( 500 )
					.call( chart );
 
				nv.utils.windowResize( chart.update );
 
				return chart;
			});
		},

		FormatGraphDate: function ( timestamp ) {
			var date = new Date( timestamp ); 
			return ( date.getMonth() + 1 ) + '/' + date.getDate() + '/' + date.getFullYear();
		}
	}

});

// Start the music

nccp.App = new App({ el: 'body' });