
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

		if ( ! $this->input->post('sensor_id') )
			die( 'sensor_id required.' );

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

				case 'update': // Update the sensor with all records since it was last updated
				case 'default':
					$query = $this->db->query( sprintf(
						"SELECT `last_updated` FROM ci_logical_sensor WHERE `nccp_id` = %d",
						$this->input->post('sensor_id')
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
			$num_results = $this->Api_data->NumberOfResults( array( $this->input->post('sensor_id') ), $start, $end );
			echo $num_results;
		}

		//$start = new DateTime( '2002-12-08T00:00:00' );
		//$end = clone $start;
		//$end->add( new DateInterval('P10Y') );		

	}	

}
