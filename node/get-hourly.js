var mysql = require( 'mysql' ),
	_ = require( 'underscore' ),
	http = require( 'http' ),
	qs = require( 'querystring' ),
	request = require( 'request' );

// Get ze config info
var config = require( 'config' );

var MAX_SENSORS = 5,
	sensorPool = [];

// Set up the connection pool
var pool = mysql.createPool({
	host: config.db.host,
	user: config.db.user,
	password: config.db.pass,
	database: config.db.name
});

MakeSensorRequest( 10 );

// Start polling
/*var interval = setInterval( function () {

	CheckSensors( pool, sensorPool );
	console.log( "Current sensors: ", sensorPool );

}, 2000 );*/

// Functions

// Check current sensors in pool and update appropriately
function CheckSensors ( pool, sensorPool ) {

	if ( sensorPool.length ) {
		_.each( sensorPool, function ( sensor ) {
			pool.getConnection( function ( err, connection ) {
				connection.query( "SELECT * FROM ci_logical_sensor_hourly WHERE logical_sensor_id = ?", [ sensor ], function ( err, rows ) {
					if ( rows[0].pending == 0 ) {
						sensorPool.splice( sensorPool.indexOf( sensor ), 1 );
						console.log( "Removing sensor: ", sensor );
					}

					connection.end();
				});
			});
		});	
	} 
			
	if ( sensorPool.length < MAX_SENSORS ) {
		GetSensor( pool, sensorPool );
	}		
	
}

// Retrieve a sensor that hasn't been updated yet
function GetSensor ( pool, sensorPool ) {

	pool.getConnection( function ( err, connection ) {
		connection.query( "SELECT * FROM ci_logical_sensor_hourly WHERE sensor_updated IS NULL AND pending = 0 LIMIT 1", function ( err, rows ) {
			//console.log( err );
			var sensorId = rows[0].logical_sensor_id;
			//MakeSensorRequest( sensorId );
			sensorPool.push( sensorId );
			console.log( "Adding sensor: ", sensorId );

			connection.end();
		});
	});

}

function MakeSensorRequest ( sensorId ) {

	request.post( 'http://nccp.local/nccp/index.php/data/update_sensor_data_hourly',
	    { form: { sensor_id: 10, period: 'P1M' } },
	    function ( error, response, body ) {
	        if ( ! error && response.statusCode == 200 ) {
	            console.log( body );
	        }
	    }
	);

	// Build the post string from an object
	/*var post_data = qs.stringify({
	    'sensor_id' : sensorId,
	    'period': 'P1M',
	});

	// An object of options to indicate where to post to
	var post_options = {
	    host: 'nccp.local',
	    port: '80',
	    path: '/nccp/index.php/data/update_sensor_data_hourly',
	    method: 'POST',
	    headers: {
	        'Content-Type': 'text/plain',
	        'Content-Length': post_data.length
	    }
	};

	// Set up the request
	var post_req = http.request( post_options, function( res ) {
	    res.setEncoding( 'utf8' );
	    res.on( 'data', function ( chunk ) {
	        console.log('Response: ' + chunk);
	    });
	});

	// post the data
	post_req.write( post_data );
	post_req.end();*/

}

// Update the sensor completion info and whatnot
// Probably not needed
function UpdateSensorInfo ( pool, sensorId ) {

	var now = new Date;
	var timestamp = now.getUTCFullYear() + '-' + ( now.getUTCMonth() + 1 ) + '-' + 
		now.getUTCDay() + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' 
		+ now.getUTCSeconds();

	pool.getConnection( function ( err, connection ) {
		connection.query( "UPDATE ci_logical_sensor_hourly SET sensor_updated = ?, pending = 0 WHERE logical_sensor_id = ?", [ timestamp, sensorId ], function ( err, rows ) {
			connection.end();
		});
	});

}