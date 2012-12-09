
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Raw calls from the NCCP API - Data service
// Note that most of these tend to be REALLY SLOW, so they generally
// shouldn't be called publicly, use the regular API class instead
// This API assumes data is already populated from the database using api_raw_measurements calls

class Data extends CI_Controller {

	public function __construct () {

		parent::__construct();
		$this->load->model('Api_data');
		$this->load->database();

		date_default_timezone_set( 'America/Los_Angeles' );
	}

	// This does what it says - so be forewarned, it takes a whiiiiile
	public function update_all_sensor_data () {



	}

	// Update sensor data of specific logical sensor
	// This responds only to POST data
	public function update_sensor_data () {

		if ( ! $this->input->post('sensor_ids') )
			die( 'At least one sensor id is required.' );

		$sensor_ids = explode( ',', $this->input->post('sensor_ids') );

		// Set time period based on requested method
		if ( $this->input->post('method') )
			switch ( $this->input->post('method') ) {
				case 'period': // Arbitrary start/end
					$start = new DateTime( $this->input->post('start') );
					$end = $this->input->post('end') == 'now' ? 
						new DateTime() :
						new DateTime( $this->input->post('end') );
				break;

				case 'duration': // Amount of time from duration until now (i.e., last 6 months)
					$end = new DateTime();
					$start = clone $end;
					$start->sub( new DateInterval( $this->input->post( 'duration' ) ) );
				break;

				case 'update': // Update the sensors with all records since it was last updated
				case 'default':
					// Get start from first
					$query = $this->db->query( sprintf(
						"SELECT `last_updated` FROM ci_logical_sensor WHERE `nccp_id` = %d",
						$sensor_ids[0]
					));

					if ( $query->num_rows() > 0 ) {
						$start = new DateTime( $query->row() );
						$end = new DateTime();
					} else
						die( "Couldn't get last updated time for property." );
				break;
			}

		// If start/end is cool, get the number of results from the API
		// and perform the data update
		if ( isset( $start ) && isset( $end ) ) {
			$num_results = $this->Api_data->NumberOfResults( $sensor_ids, $start, $end );

			$skip = 0;

			//print_r( $num_results );

			while ( $skip < $num_results ) {
				// Set the time limit before proceeding
				set_time_limit( 300 );

				// Now that we have that, fetch the data values
				$data = $this->Api_data->search( $sensor_ids, $start, $end, $skip, 1000 );
				$this->process_data_set( $data );
				$skip += 1000;
			}	

			// If that succeeded, output success
			echo json_encode( array(
				'success' => $num_results . " entries entered successfully."
			));		

			// jQuery.post( '/data/index.php/data/update_sensor_data', { method: 'duration', duration: 'P6M', sensor_id: 7 }, function ( response ) { console.log( response ) } );
			//print_r( $data );			
		}	

	}

	private function process_data_set ( &$data ) {
		// Normal inserts
		/*foreach ( $data as $row )
			$this->db->query( sprintf(
				"INSERT IGNORE INTO ci_logical_sensor_data VALUES( %d, '%s', %.18f )",
				$row->LogicalSensorId,
				$row->TimeStamp,
				$row->Value
			));*/

		// Compound insert statements
		$sql = "INSERT IGNORE INTO ci_logical_sensor_data VALUES ";

		foreach ( $data as $index => $row ) {
			$sql .= sprintf(
				"( %d, '%s', %.18f )",
				$row->LogicalSensorId,
				$row->TimeStamp,
				$row->Value
			);

			if ( $index != ( count( $data ) - 1 ) )
				$sql .= ',';
		}

		$this->db->query( $sql );

	}	

}
