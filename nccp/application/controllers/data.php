
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Raw calls from the NCCP API - Data service
// Note that most of these tend to be REALLY SLOW, so they generally
// shouldn't be called publicly, use the regular API class instead
// This API assumes data is already populated from the database using api_raw_measurements calls

class Data extends CI_Controller {

	public function __construct () {

		parent::__construct();
		$this->load->model( 'Api_data' );
		$this->load->database();

		date_default_timezone_set( 'America/Los_Angeles' );
	}

	// Update all available sensors since last updated date (or to specified period, whichever is longer)
	// Params:
	// period - how far back to update, specified in interval format (P6M, P2W, etc.)
	public function update_all_sensors () {

		// Get the sensors
		$query = $this->db->query( "SELECT * FROM ci_logical_sensor" );

		foreach ( $query->result() as $sensor ) {
			$this->update_sensor_data( $sensor->logical_sensor_id, 'P1M' );
			set_time_limit( 300 );
		}

		// Output success if we got this far
		echo json_encode( array( 'success' => 'sensors successfully updated' ) );		

	}

	// Update sensor data of specific logical sensor
	// Params:
	// sensor_ids - single or comma-separated list
	// period - how far back to update, specified in interval format (P6M, P2W, etc.)
	public function update_sensor_data ( $sensor = null, $period = null ) {

		// How many records should be processed at once
		// 1000 is simply the max the NCCP API will return, so no point going
		// higher than
		$num_to_process = 1000;

		// Make sure we should be here
		if ( ! ( $this->input->post('sensor_id') || $sensor ) ) die( 'Sensor id is required.' );
		if ( ! ( $this->input->post('period') || $period ) ) die( 'Period must be specified' );

		$sensor_id = $sensor ? $sensor : $this->input->post('sensor_id');
		$period = $period ? $period : $this->input->post( 'period' );

		// Set up timekeeping - note that the END is always now, the START is at the end - <specified period>
		$end = new DateTime();
		$start = clone $end;
		$start->sub( new DateInterval( $period ) );

		// Get the last dates the sensor was updated and see if that period is shorter than the specified one
		$query = $this->db->query( sprintf(
			"SELECT * FROM ci_logical_sensor WHERE logical_sensor_id = %d",
			$sensor_id
		));

		// If a last updated date exists, use that as the start insted of the period
		//if ( $query->num_rows() > 0 )
		//	$start = new DateTime( $query->row()->last_timestamp );		

		// If start/end is cool, get the number of results from the API
		// and perform the data update
		if ( isset( $start ) && isset( $end ) ) {

			// Figure out how much data there is
			$num_results = $this->Api_data->NumberOfResults( array( $sensor_id ), $start, $end );
			//print_r( $num_results . "\n" );

			$skip = 0;

			// Start time of processing
			$start_time = new DateTime();

			while ( $skip < $num_results ) {
				// Set the time limit before proceeding
				set_time_limit( 300 );

				// Now that we have that, fetch the data values
				$data = $this->Api_data->search( array( $sensor_id ), $start, $end, $skip, $num_to_process );
				$this->process_data_set( $data, $num_results, $skip, $num_to_process );
				$skip += $num_to_process;
			}					

			// If that succeeded, enter new timestamps into logical_sensor table, calculate processing time and output success

			// Calculate processing time
			$end_time = new DateTime();

			$difference = $start_time->diff( $end_time );

			echo json_encode( array(
				'sensor' => $sensor_id,
				'success' => $num_results . " entries entered successfully.",
				'time_elapsed' => $difference->format( '%h:%i:%s' )
			));		
		}
	}

	private function process_data_set ( &$data, $num_results, $skip, $num_to_process ) {	

		// Compound insert statements
		$sql = "INSERT IGNORE INTO ci_logical_sensor_data VALUES ";	

		foreach ( $data as $index => $row ) {			
			// If this is the first record, set the first updated record
			if ( $index == 0 && $skip == 0 ) {
				$date = new DateTime( $row->TimeStamp );
				$this->db->query( sprintf(
					"UPDATE ci_logical_sensor SET `first_timestamp` = '%s', `first_unix_timestamp` = %d WHERE `logical_sensor_id` = %d",
					$row->TimeStamp,
					$date->getTimestamp(),
					$row->LogicalSensorId
				));
			}

			// If the the last record, update the last updated record
			if ( ( $skip + $num_to_process >= $num_results ) && ( $index == count( $data ) - 1 ) ) {
				$date = new DateTime( $row->TimeStamp );
				$this->db->query( sprintf(
					"UPDATE ci_logical_sensor SET `last_timestamp` = '%s', `last_unix_timestamp` = %d WHERE `logical_sensor_id` = %d",
					$row->TimeStamp,
					$date->getTimestamp(),
					$row->LogicalSensorId
				));
			}

			// Create unix timestamp from data timestamp
			$date = new DateTime( $row->TimeStamp );

			$sql .= sprintf(
				"( %d, '%s', %d, %.18f )",
				$row->LogicalSensorId,
				$row->TimeStamp,
				$date->getTimestamp(),
				$row->Value				
			);

			if ( $index != ( count( $data ) - 1 ) )
				$sql .= ',';
		}

		$this->db->query( $sql );

	}

	// Formats DateTime object into useable string, either
	// in standard mysql or asp formats
	private function format_date ( $date, $type = 'asp' ) {

		return $type == 'asp' ? $date->format( "Y-m-d\TH:i:s" ) : $date->format( "Y-m-d H:i:s" );

	}	

}
