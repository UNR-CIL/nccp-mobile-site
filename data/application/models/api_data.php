
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Raw calls from the NCCP API - Data service
// Note that most of these tend to be REALLY SLOW, so they generally
// shouldn't be called publicly, use the regular API class instead
// This API assumes data is already populated from the database using api_raw_measurements calls

class Api_data extends CI_Model {

	private $data_client;

	public function __construct () {

		parent::__construct();
		$this->load->database();

		$this->data_client = new SoapClient( 'http://sensor.nevada.edu/Services/DataRetrieval/DataRetrieval.svc?wsdl' );
	
	}

	public function build_sensor_specification () {
		
	}

	// Retrieve list of available time zones in the NCCP API
	public function get_time_zones () {

		$timezones = $this->measurements_client->ObtainTimeZones();
		print_r( $timezones );

	}

	// Get the current list of available sensors
	public function get_sensors () {

		$sensors = $this->measurements_client->ListLogicalSensorInformation();

		foreach ( range( 0, 10 ) as $row )
			print_r( $sensors->ListLogicalSensorInformationResult->LogicalSensor[$row] );

	}

	

}
