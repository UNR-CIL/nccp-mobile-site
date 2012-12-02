
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Raw calls from the NCCP API
// Note that most of these tend to be REALLY SLOW, so they generally
// shouldn't be called publicly, use the regular API class instead

class API_Raw_Data extends CI_Controller {

	private $data_client;

	public function __construct () {
		parent::__construct();
		$this->load->database();

		$this->data_client = new SoapClient( 'http://sensor.nevada.edu/Services/DataRetrieval/DataRetrieval.svc?wsdl' );
	}

	public function update_sensors () {

		$sensors = $this->get_sensors();

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

	public function convert_from ( $unit_id ) {
		$id = $this->uri->segment( 3 ) ? $this->uri->segment( 3 ) : $unit_id;

		$conversions = $this->measurements_client->ListAvailableConversionsFrom( array( 'originalUnitId' => $id ) );
		print_r( $conversions );
		
	}

	public function convert_to ( $unit_id ) {
		$id = $this->uri->segment( 3 ) ? $this->uri->segment( 3 ) : $unit_id;

		$conversions = $this->measurements_client->ListAvailableConversionsTo( array( 'newUnitId' => $id ) );
		print_r( $conversions );
	}

}
