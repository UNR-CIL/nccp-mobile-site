/* 
  API for providing access to the data caching database.  The database
  itself is populated via a separate CodeIgniter API which is run auto-
  matically.  This is meant to provide quick access to the staging database
  with as little overhead as possible
*/

// Example query
// $.ajax( 'http://nccp.local:6227/api/get?callback=?', { dataType: 'json', data: { sensor_id: 7, count: 10 }, success: function ( response, status, xhr ) { console.log( response, status, xhr ) }, error: function ( one, two, three ) { console.log( two, three ) } } )

// Get the mysql driver and express for building the RESTful-ness
var db = require( 'mysql' );
var e = require( 'express' );
var _ = require( 'underscore' );
var http = require( 'http' );

// Parameters
var port = 6227, // No, this isn't random
	intervals = { // Period plus the record offset corresponding to it
		yearly: 525600,
		monthly: 43200, 
		weekly: 10080,
		daily: 1440,
		hourly: 60,
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
//$.ajax( 'http://nccp.local:6227/nccp/get?callback=?', { crossDomain: true, dataType: 'json', data: { sensor_id: 7, count: 10 }, success: function ( response, status, xhr ) { console.log( response, status, xhr ) }, error: function ( one, two, three ) { console.log( two, three ) } } )
api.get( '/api/get', function ( request, response ) {

	var q = request.query;

	// Make sure this is a valid request
	if ( ! q.sensor_id ) {
		response.jsonp( { error: 'Must send valid sensor ID.' } );
	} else if ( ! q.start || ! q.end ) {
		response.jsonp( { error: 'Must send valid start and end' } );
	}	

	console.log( 'Request received for sensor ' + request.query.sensor_id );

	// Set parameters up

	// Set the period up if the parameter was passed
	var skip = 1;

	if ( request.query.interval && _.has( intervals, request.query.interval ) )
		skip = intervals[request.query.interval];

	if ( request.query.count )
		limit = request.query.count;

	// Set up the database connection
	var conn = db.createConnection({
		host: 'dev.monterey-j.com',
		user: 'nccp_admin',
		password: 'd7yt$7s2Ol9!5~742ee',
		database: 'nccp'
	});

	conn.connect();

	// Send the query
	conn.query( "SELECT timestamp, value " + 
		"FROM ( SELECT @row := @row +1 AS rownum, logical_sensor_id, timestamp, value " +
		"FROM ( SELECT @row :=0) r, ci_logical_sensor_data ) ranked " +
		"WHERE rownum % ? = 0 AND logical_sensor_id = ? LIMIT ?",
		[skip, request.query.sensor_id, parseInt( limit )], 
		function ( err, rows, fields ) {
			console.log( 'Sending response...' );

			response.jsonp( request.query.format ? format_data( rows, request.query.format ) : rows );

	});

});

// Check main NCCP portal status
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
