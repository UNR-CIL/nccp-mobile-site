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
	periods = { // Period plus the record offset corresponding to it
		yearly: 525600,
		monthly: 43200, 
		weekly: 10080,
		daily: 1440,
		hourly: 60,
		minutely: null // Probably a word
	},
	limit = 1000000000; // ONE BEEELION ROWS

// Make the app
var api = e();

// Configure said app
api.configure( function () {
	api.use( e.compress() );
});

// Define the API routes

// Request data points from the database
api.get( '/api/get', function ( request, response ) {

	if ( request.query.sensor_id ) {

		console.log( 'Request received for sensor ' + request.query.sensor_id );

		// Set parameters up

		// Set the period up if the parameter was passed
		var skip = 1;

		if ( request.query.period && _.has( periods, request.query.period ) )
			skip = periods[request.query.period];

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

				// Example request
				//$.ajax( 'http://nccp.local:6227/nccp/get?callback=?', { crossDomain: true, dataType: 'json', data: { sensor_id: 7, count: 10 }, success: function ( response, status, xhr ) { console.log( response, status, xhr ) }, error: function ( one, two, three ) { console.log( two, three ) } } )
		});		

	} else

		response.send( { error : 'Must send at least one logical sensor ID.' } );	

});

// Check main NCCP portal status
// This includes the site itself along with the Web Services
// (Measurement and Data)
api.get( '/api/status', function ( request, response ) {

	// Blank objects for containing success or error messages for each
	// server we're checking
	var status = {}, error = {};

	// Set up parameters
	var params = {
		host: 'sensor.nevada.edu',
		port: 80,
		path: '/NCCP/Default.aspx'
	}

	// First check the main site - no point checking the other stuff if the
	// main server isn't up
	http.get( params, function( res ) {
		console.log( res.statusCode );
		response.send( 'Request successful' );
	}).on( 'error', function ( error ) {
		response.send("Error: " + error );
	});

});

// Start the music ///////////////////////////////////////

api.listen( port );

console.log( 'Data API is active on port ' + port );

// Useful functions //////////////////////////////////////

function format_data ( data, format ) {
	var final = [];

	if ( format == 'raw' )
		_.each( data, function ( el ) {
			final.push( el.value );
		});

	return final;
}
