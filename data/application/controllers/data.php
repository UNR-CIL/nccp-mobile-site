
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Raw calls from the NCCP API - Data service
// Note that most of these tend to be REALLY SLOW, so they generally
// shouldn't be called publicly, use the regular API class instead
// This API assumes data is already populated from the database using api_raw_measurements calls

class Data extends CI_Controller {

	public function __construct () {

		parent::__construct();

		$this->load->model('Api_data');

	}

	// This does what it says - so be forewarned, it takes a whiiiiile
	public function update_all_sensor_data () {

	}

	// Update sensor data of specific logical sensor
	public function update_sensor_data ( $id ) {

	}	

	public function search () {

		$start = new DateTime( '2012-12-01T03:00:00' );
		$end = clone $start;
		$end->add( new DateInterval('P6M') );
		$this->Api_data->search( array( 6, 7 ), $start, $end );

	}

	// Get the current list of available sensors
	public function get_sensors () {

		$sensors = $this->measurements_client->ListLogicalSensorInformation();

		foreach ( range( 0, 10 ) as $row )
			print_r( $sensors->ListLogicalSensorInformationResult->LogicalSensor[$row] );

	}

	

}
