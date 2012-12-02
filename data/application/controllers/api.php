// API class for accessing API info from database.  
// Use raw_api to call the NCCP Web Services directly

<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class API extends CI_Controller {

	public function __construct () {
		
		parent::__construct();
		$this->load->database();

	}

	public function update_sensors () {
		$sensors = $this->get_sensors();

		//$data = new SoapClient( 'http://sensor.nevada.edu/Services/DataRetrieval/DataRetrieval.svc?wsdl' );

		//print_r( $data->__getFunctions() );

		//echo "update";
	}

	public function get_time_zones () {

	}

	public function get_sensors () {
		$measurements = new SoapClient( 'http://sensor.nevada.edu/Services/Measurements/Measurement.svc?wsdl' );

		$sensors = $measurements->ListLogicalSensorInformation();

		print_r( $sensors->ListLogicalSensorInformationResult->LogicalSensor[0] );
	}

	public function get_sensor ( $sensor_id ) {

	}

}
