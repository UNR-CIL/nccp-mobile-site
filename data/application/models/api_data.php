
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Raw calls from the NCCP API - Data service
// Note that most of these tend to be REALLY SLOW, so they generally
// shouldn't be called publicly, use the regular API class instead
// This API assumes data is already populated from the database using api_raw_measurements calls

class Api_data extends CI_Model {

	private $data_client;
	private $default_timezone = 'Pacific Standard Time'; // This is assumed to be PST for the moment

	public function __construct () {

		parent::__construct();
		$this->load->database();

		$this->data_client = new SoapClient( 'http://sensor.nevada.edu/Services/DataRetrieval/DataRetrieval.svc?wsdl' );
	
	}

	public function search ( $sensor_ids, $start, $end ) {
		// Get the specification object
		$specification = $this->build_sensor_specification( $sensor_ids, $start, $end );

		// Send the query to the data API
		$results = $this->data_client->Search( array( "search" => $specification, "skip" => 0, "take" => 10 ) );

		print_r( $results );
	}

	// Build sensor specification for passing to data search method
	// Sensor IDs is an array of sensor IDs (can be a single value)
	public function build_sensor_specification ( $sensor_ids, $start, $end ) {

		if ( ! is_array( $sensor_ids ) )
			$sensor_ids = array( $sensor_ids );
		
		// Retrieve the logical sensor information
		$sensors = $this->get_sensors( $sensor_ids );

		// Retrieve the sensor Unit information
		$units = $this->get_units( $sensor_ids );

		// Get timezone information
		$timezone = $this->get_timezone( $this->default_timezone );

		// Build the sensor specification
		$specification = new stdClass();

	    $specification->Sensors = array();	    

	    foreach ( $sensors as $index => $sensor ) {
	    	$sensor_object = new stdClass();
	    	$sensor_object->LogicalSensorId = $sensor->nccp_id;
	    	$sensor_object->UnitId = $units[$index]->unit_id;
	    	$specification->Sensors[] = $sensor_object;
	    }	    

	    $specification->TimeZone = new stdClass();
	    $specification->TimeZone->BaseUtcOffset = $timezone->offset;
	    $specification->TimeZone->DaylightName = $timezone->daylight_name;
	    $specification->TimeZone->DisplayName = $timezone->display_name;  
	    $specification->TimeZone->Id = $timezone->nccp_timezone_id;  
	    $specification->TimeZone->StandardName = $timezone->standard_name;
	    $specification->TimeZone->SupportsDaylightSavingsTime = $timezone->dst_support;

	    // Get formatted dates for start and end

	    $specification->Starting = $this->format_date( $start );
	    $specification->Ending = $this->format_date( $end );

	    //print_r( $specification );

	    return $specification;

	}

	// Retrieve the Unit information associated with the logical sensor
	private function get_units ( $sensor_ids ) {

		// Get the unit IDs from relationships
		if ( ! empty( $sensor_ids ) ) {
			$sql = sprintf(
				"SELECT `unit_id` FROM ci_logical_sensor_relationships WHERE "
			);

			if ( count( $sensor_ids ) > 1 )
				foreach ( $sensor_ids as $index => $id ) {
					$sql .= sprintf(  
						"`logical_sensor_id` = %d",
						$id
					);

					if ( $index != ( count( $sensor_ids ) - 1 ) )
						$sql .= ' OR ';
				}
			else
				$sql .= sprintf(  
					"`logical_sensor_id` = %d",
					$sensor_ids[0]
				);	
		}

		return $this->return_results( $this->db->query( $sql ));

	}

	// Retrieve logical sensor info based on array of ids
	private function get_sensors ( $sensor_ids ) {

		if ( ! empty( $sensor_ids ) ) {
			$sql = sprintf(
				"SELECT * FROM ci_logical_sensor WHERE "
			);

			if ( count( $sensor_ids ) > 1 )
				foreach ( $sensor_ids as $index => $id ) {
					$sql .= sprintf(  
						"`nccp_id` = %d",
						$id
					);

					if ( $index != ( count( $sensor_ids ) - 1 ) )
						$sql .= ' OR ';
				}
			else
				$sql .= sprintf(  
					"`nccp_id` = %d",
					$sensor_ids[0]
				);	
		}			

		return $this->return_results( $this->db->query( $sql ));

	}

	// Get timezone.  
	private function get_timezone ( $id_string ) {

		return $this->return_results( $this->db->query( sprintf(
			"SELECT * FROM ci_timezones WHERE `nccp_timezone_id` = '%s'",
			$id_string
		)));

	}

	// Checks query object for results and returns results if so or false if not
	private function return_results ( $query_object ) {

		if ( $query_object->num_rows() > 0 )
			return $query_object->num_rows() == 1 ? $query_object->row() : $query_object->result();
		else
			return false;

	}

	// Formats DateTime object into useable string, either
	// in standard mysql or asp formats
	private function format_date ( $date, $type = 'asp' ) {

		return $type == 'asp' ? $date->format( "Y-m-d\TH:i:s" ) : $date->format( "Y-m-d H:i:s" );

	}

}
