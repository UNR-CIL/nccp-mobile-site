// TODO: Change sensor pull query to also check if sensor was updated recently so it doesn't keep trying
// on the same sensor over and over

var mysql = require( 'mysql' ),
	_ = require( 'underscore' ),
	http = require( 'http' ),
	qs = require( 'querystring' ),
	request = require( 'request' );

// Get ze config info
var config = require( 'config' );

var MAX_SENSORS = 5,
	sensorPool = [],
	rowCount = 0;

// Set up the connection pool
var pool = mysql.createPool({
	host: config.db.host,
	user: config.db.user,
	password: config.db.pass,
	database: config.db.name
});

// Start polling every ten seconds
var interval = setInterval( function () {

	// Check the current sensor pool and remove old sensors/add new ones as needed
	CheckSensors( pool, sensorPool );

	// And make sure we're actually still moving
	CheckRowCount( pool, sensorPool );

	console.log( "Current sensors: ", sensorPool );

}, 15000 );

// Events

process.on( 'SIGINT', function() {
    console.log("\nShutting down...");

    pool.end();
    process.exit( 0 );
});

// Functions

// Check current sensors in pool and update appropriately
function CheckSensors ( pool, sensorPool ) {

	if ( sensorPool.length ) {
		_.each( sensorPool, function ( sensor ) {
			pool.getConnection( function ( err, connection ) {
				if ( err ) console.log( err );

				connection.query( "SELECT * FROM ci_logical_sensor_hourly WHERE logical_sensor_id = ?", [ sensor ], function ( err, rows ) {
					if ( err ) console.log( err );

					if ( rows ) {
						if ( rows[0].pending == 0 ) {
							sensorPool.splice( sensorPool.indexOf( sensor ), 1 );
							console.log( "Removing sensor: ", sensor );
						}	
					} else {
						pool.end();
					}					

					connection.end();
				});
			});
		});	
	} 
			
	if ( sensorPool.length < MAX_SENSORS ) {
		GetSensor( pool, sensorPool );
	} else {
		console.log( "Idling..." );
	}	
	
}

// Retrieve a sensor that hasn't been updated yet
function GetSensor ( pool, sensorPool ) {

	pool.getConnection( function ( err, connection ) {
		if ( err ) console.log( err );

		// First get a sensor that needs to be updated (is out of date by > 1 day)
		// along with the last timestamp for that sensor
		// If timestamp is empty this means there's no data for that sensor
		connection.query( "SELECT list.logical_sensor_id FROM ci_logical_sensor_hourly AS list " +
			"WHERE pending = 0 " + 
			"AND ( ( ( sensor_updated + INTERVAL 2 DAY ) < NOW() ) OR sensor_updated IS NULL ) " +
			"AND list.logical_sensor_id NOT IN " +
			"( SELECT DISTINCT logical_sensor_id " +
			"FROM ci_logical_sensor_data_hourly " +
			"WHERE `timestamp` > ( NOW() - INTERVAL 2 DAY ) " +
			"ORDER BY logical_sensor_id ) LIMIT 1",
			function ( err, rows ) {
				if ( err ) console.log( err );

				if ( rows ) {
					var sensorId = rows[0].logical_sensor_id;
					if ( sensorPool.indexOf( sensorId ) == -1 ) {
						MakeSensorRequest( sensorId );
						sensorPool.push( sensorId );
						console.log( "Adding sensor: ", sensorId );
					} else {
						console.log( "Sensor " + sensorId + " already in pool." );
					}
					
				} else {
					pool.end(); // Guess we're done, so end it
				}			

				connection.end();
		});
	});

}

function MakeSensorRequest ( sensorId ) {

	request.post( config.paths.base + 'nccp/index.php/data/update_sensor_data_hourly',
	    { form: { sensor_id: sensorId, period: 'update' } },
	    function ( error, response, body ) {
	    	if ( error ) console.log( error );

	        if ( ! error && response.statusCode == 200 ) {
	            console.log( body );
	        }
	    }
	);

}

function CheckRowCount ( pool, sensorPool ) {
	pool.getConnection( function ( err, connection ) {
		if ( err ) console.log( err );

		connection.query( "SELECT COUNT(*) AS rows FROM ci_logical_sensor_data_hourly",	function ( err, rows ) {
			if ( err ) console.log( err );		

			// This means something is wrong and we need to start over
			if ( rows[0].rows == rowCount ) {
				ResetSensors( pool, sensorPool );
				console.log( "Data count hasn't changed.  Resetting sensors..." );
			}

			rowCount = rows[0].rows;
			console.log( "Total rows: ", rowCount );
			connection.end();
		});
	});
}

// Release all the current sensors back into the wild (set pending status to 0)
// This will force the get request to the API to be made again
function ResetSensors ( pool, sensorPool ) {

	if ( sensorPool.length ) {
		_.each( sensorPool, function ( sensor ) {
			pool.getConnection( function ( err, connection ) {
				if ( err ) console.log( err );

				connection.query( "UPDATE ci_logical_sensor_hourly SET pending = 0 WHERE logical_sensor_id = ?", [ sensor ], function ( err, rows ) {
					if ( err ) console.log( err );					

					connection.end();
				});
			});
		});	
	}

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
