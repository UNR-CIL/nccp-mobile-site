/* 
  API for providing access to the data caching database.  The database
  itself is populated via a separate CodeIgniter API which is run auto-
  matically.  This is meant to provide quick access to the staging database
  with as little overhead as possible
*/

// Example query

// Get the mysql driver and express for building the RESTful-ness
var db = require( 'mysql' ),
	e = require( 'express' ),
	_ = require( 'underscore' ),
	http = require( 'http' );

// Get ze config info
var config = require( 'config' );

// Parameters
var table = 'ci_logical_sensor_data',
	port = 6227, // No, this isn't random
	intervals = { // Period plus the record offset corresponding to it
		year: 525600,
		yearly: 525600,
		month: 43200,
		monthly: 43200, 
		week: 10080,
		weekly: 10080,
		day: 1440,
		daily: 1440,
		hour: 60,
		hourly: 60,
		minute: null,
		minutely: null // Probably a word
	},
	limit = 1000000000; // ONE BEEELION ROWS.  This is seriously the best way to default 'all rows' in mysql. /shrug

// Make the app
var api = e();

// Configure said app
api.configure( function () {
	api.use( e.compress() );
});

// Define the API routes

// Request data points from the database
// Params:
// sensor_id*
// start*
// end*
// period: time format - P1M, PT6H are examples
// count: limit results
// format: 'raw' will return array of ONLY data values, no timestamps
// Example AJAX request:
// $.getJSON( 'http://nccp.local:6227/api/get/?callback=?', { sensor_id: 7, count: 10, start: '2013-02-08', end: '2013-02-10' }, function ( response ) { console.log( response ) } )
api.get( '/api/get', function ( request, response ) {

	var q = request.query;

	// Make sure this is a valid request
	if ( ! q.sensor_id ) {
		response.jsonp( { error: 'Must send valid sensor ID.' } );
	} else if ( ! q.start || ! q.end ) {
		response.jsonp( { error: 'Must send valid start and end' } );
	} else {
		console.log( 'Request received for sensor ' + q.sensor_id );

		// Set parameters up

		if ( q.interval && _.has( intervals, q.interval) ) {
			var skip = intervals[request.query.interval]; 
		}

		// If interval is >= hourly, use the hourly table
		if ( q.interval && q.interval != 'minute' ) {
			table = "ci_logical_sensor_data_hourly";
			skip /= 60;
		}		
		
		// If interval is set, multiply the limit by the skip because
		// the interval is processed server-side, not in the DB (quicker)
		if ( q.count ) limit = skip ? q.count * skip : q.count;

		// Set up the database connection
		var conn = db.createConnection({
			host: config.db.host,
			user: config.db.user,
			password: config.db.pass,
			database: config.db.name
		});

		conn.connect();

		// Send the query
		conn.query( "SELECT timestamp, value " + 
			"FROM " + table + " " + 
			"WHERE logical_sensor_id = ? AND timestamp " + 
			"BETWEEN ? AND ? LIMIT ?",
			[ parseInt( q.sensor_id ), q.start, q.end, parseInt( limit ) ], 
			function ( err, rows, fields ) {
				console.log( 'Sending response...' );

				// Process errors first
				if ( err ) {

					console.log( err );
					response.jsonp( { error: 'An error occurred. =(' } );

				// Otherwise process the results
				} else {

					if ( rows.length > 0 ) {
						// Process interval if passed, otherwise send results straight through
						if ( skip ) {

							var final_results = [];
							
							for ( var i = 0; i < rows.length; i += skip ) {
								final_results.push( rows[i] );
							}								

							response.jsonp( q.format ? format_data( final_results, q.format ) : final_results );
							
						} else

							response.jsonp( request.query.format ? format_data( rows, request.query.format ) : rows );

					} else

						response.jsonp( { msg: 'No results found.' } );
				}

		});	
	}	

});

// Check main NCCP portal status
// Example AJAX call
// $.getJSON( 'http://nccp.local:6227/api/status/website?callback=?', function ( response ) { console.log( response ) } )
api.get( '/api/status/website', function ( request, response ) {

	// Set up parameters
	var params = {
		host: 'sensor.nevada.edu',
		port: 80,
		path: '/NCCP/Default.aspx'
	}

	// Check the main site
	check_url( params, function ( result ) {
		if ( result.up ) {
			response.jsonp({ success: 'The NCCP portal is up.' });
		} else {
			response.jsonp({ error: 'The NCCP portal is currently down.' });
		}	
	});	

});

// Check NCCP Measurement service status
api.get( '/api/status/services/measurement', function ( request, response ) {

	// Set up parameters
	var params = {
		host: 'sensor.nevada.edu',
		port: 80,
		path: '/Services/Measurements/Measurement.svc'
	};

	// Check the Measurement service
	check_url( params, function ( result ) {
		if ( result.up ) {
			response.jsonp({ success: 'The measurement service is up.' });
		} else {
			response.jsonp({ error: 'The measurement service is currently down.' });
		}	
	});	

});

// Check NCCP Data service status
api.get( '/api/status/services/data', function ( request, response ) {

	// Set up parameters
	var params = {
		host: 'sensor.nevada.edu',
		port: 80,
		path: '/Services/DataRetrieval/DataRetrieval.svc'
	};

	// Check the Data service
	check_url( params, function ( result ) {
		if ( result.up ) {
			response.jsonp({ success: 'The data service is up.' });
		} else {
			response.jsonp({ error: 'The data service is currently down.' });
		}	
	});	

});

// Start the music ///////////////////////////////////////

api.listen( port );

console.log( 'Data API is active on port ' + port );

// Useful functions //////////////////////////////////////

// Check url and return appropriate success/error to callback
function check_url ( params, callback ) {

	// Send the request
	http.get( params, function( res ) {

		// Respond with the status depending on how it went
		callback( res.statusCode == 200 ? { up: true } : { up: false, code: res.statusCode } );
		
	}).on( 'error', function ( error ) {

		// If we couldn't connect, don't even send status code
		callback( { up: false } );

	});

}

function format_data ( data, format ) {
	var final = [];

	if ( format == 'raw' )
		_.each( data, function ( el ) {
			final.push( el.value );
		});

	return final;
}
