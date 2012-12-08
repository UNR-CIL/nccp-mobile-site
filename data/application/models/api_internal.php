// API class for accessing API info from database.  
// Use raw_api to call the NCCP Web Services directly

<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class API extends CI_Controller {

	public function __construct () {
		
		parent::__construct();
		$this->load->database();

	}

	// Returns all time zones in the system
	public function get_time_zones () {
		return $this->return_results( $this->db->query( "SELECT * FROM ci_timezones" ) );		
	}

	// id is a string specifying the time zone (ex. 'Pacific Standard Time')
	// Returns an offset and various names for the time zone
	public function get_time_zone ( $id ) {
		return $this->return_results( $this->db->query( sprintf( 
			"SELECT * FROM ci_timezones WHERE `nccp_timezone_id` = '%s'",
			$id 
		)));
	}

	// Returns all current sensors in database
	// Note that this is probably a bad idea because there
	// are over 2000 sensors on average
	public function get_all_sensors () {
		return $this->return_results( $this->db->query( sprintf(
			"SELECT * FROM ci_logical_sensor"
		)));
	}

	// Returns sensors based on specified search properties
	public function get_sensors ( $args ) {
		
	}

	// Get single sensor based on specified search properties
	public function get_sensor ( $args ) {

	}

	// Get sensor deployment.  This includes multiple sensors
	// per deployment.
	public function get_deployment ( $deployment_id ) {

	}

	// Get sensor property based on search properties.  Note that property ID 
	// corresponds to multiple sensors
	public function get_property ( $args ) {

	}

	// Checks query object for results and returns results if so or false if not
	private function return_results ( $query_object ) {
		return $query_object->num_rows() > 0 ? $query_object->result() : false;
	}

}
