var App = Backbone.View.extend({

	attributes: {
		//DATA_SERVER	: "http://nccp.local:6227",
		DATA_SERVER 	: 'http://ec2-54-241-223-209.us-west-1.compute.amazonaws.com:6227',
	},

	// Initial view setup - load functions, jQuery UI setup, etc.
	initialize: function () {
		var $ = jQuery, // In case $.noConflict was called
			app = this;

		// Generic Setup //////////////////////////////////////////
		this.CollapsibleLinks();

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
			this.DataSelection();
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
	CollapsibleLinks: function () {

	},

	RandomGraph: function () {

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

	DataSelection: function () {

	},

	LoadGraphs: function () {

	},

	// Functionality ///////////////////////////////////


	// Internal functions ///////////////////////////////////////////
	_BuildSensorList: function ( sensors ) {
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

	_GetSensorData: function ( sensor_id, period, flot, callback ) {
		var options = { 'sensor_id' : sensor_id };
	
		if ( period ) options.period = period;
		
		$.post( '/data/index.php/api/get_sensor_data', options, function ( response ) { 
			callback( response ); 
		});
	}
});

// Start the music

var application = new App({ el: 'body' });