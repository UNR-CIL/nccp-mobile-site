<?php

// Standalone script for updating the list of logical sensors
// This is separate from the actual sensor data update script because
// the list of sensors does not need to be updated as often

// Set the URLs
//define( 'UPDATE_SENSORS_URL', "http://nccp.local/nccp/index.php/measurements/update_sensors" ); // Local
define( 'UPDATE_SENSORS_URL', "http://nccp.monterey-j.com/nccp/index.php/measurements/update_sensors" ); // Live

$ch = curl_init(); 

// Set curl params
curl_setopt( $ch, CURLOPT_URL, UPDATE_SENSORS_URL ); 
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );

// Extend these a bit just in case 
curl_setopt( $ch, CURLOPT_TIMEOUT, 300 );  
set_time_limit( 300 );

// Update the sensor list
echo curl_exec( $ch );

// Close curl out
curl_close($ch);
