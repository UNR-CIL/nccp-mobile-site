
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Raw calls from the NCCP API
// Note that most of these tend to be REALLY SLOW, so they generally
// shouldn't be called publicly, use the regular API class instead

class API_Raw_Measurements extends CI_Controller {

	private $measurements_client;

	public function __construct () {

		parent::__construct();
		$this->load->database();

		$this->measurements_client = new SoapClient( 'http://sensor.nevada.edu/Services/Measurements/Measurement.svc?wsdl' );

	}

	// Update the database with the current list of sensors
	public function update_sensors () {

		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor' ); // Blow out old sensor data before continuing
		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor_deployment' );
		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor_property' );

		$sensors = $this->get_sensors();

		if ( ! empty( $sensors ) ) {
			foreach ( $sensors as $sensor ) {

				print_r( $sensor );

				// Format the sensor coordinates
				preg_match( "/\((.+)\s(.+)\s(.+)\)/i", $sensor->LocationWkt, $coords );
				
				// Insert the main sensor data
				$this->db->query( sprintf(
					"INSERT INTO ci_logical_sensor VALUES ( NULL, %d, '%s', '%s', '%s', '%s', %d, '%s', %d, '%s', %d, '%s', '%s', %d, '%s' )",
					$sensor->Id,
					$sensor->MeasurementInterval,
					$coords[2],
					$coords[1],
					$coords[3],
					$sensor->SurfaceAltitudeOffset,
					$sensor->Type->Description,
					$sensor->Type->Id,
					$sensor->Type->Name,
					$sensor->Unit->Id,
					$sensor->Unit->Name,
					$sensor->Unit->Abbreviation,
					$sensor->Unit->Aspect->Id,
					$sensor->Unit->Aspect->Name
				));

				// Insert Deployment info
				preg_match( "/\((.+)\s(.+)\s(.+)\)/i", $sensor->Deployment->LocationWkt, $coords );

				$this->db->query( sprintf(
					"INSERT INTO ci_logical_sensor_deployment VALUES ( NULL, %d, '%s', '%s', '%s', '%s', %d, '%s' )",
					$sensor->Deployment->Id,
					$coords[2],
					$coords[1],
					$coords[3],
					$sensor->Deployment->Name,
					$sensor->Deployment->Site->Id,
					$sensor->Deployment->Site->Name
				));

				// Insert Sensor Property info
				$this->db->query( sprintf(
					"INSERT INTO ci_logical_sensor_property VALUES ( NULL, %d, '%s', '%s', %d, '%s' )",
					$sensor->MonitoredProperty->Id,
					addslashes( $sensor->MonitoredProperty->Description ),
					$sensor->MonitoredProperty->Name,
					$sensor->MonitoredProperty->System->Id,
					$sensor->MonitoredProperty->System->Name
				));
			}	
		}	

	}

	// Update the current list of available timezones
	public function update_timezones () {

		$timezones = $this->get_time_zones();
 
		if ( ! empty( $timezones ) ) {
			$this->db->query( "TRUNCATE TABLE ci_timezones" ); // Clear the current timezone listing

			foreach ( $timezones as $timezone ) {
				print_r( $timezone );

				$this->db->query( sprintf(
					"INSERT INTO ci_timezones VALUES ( NULL, '%s', '%s', '%s', '%s', '%s', %d )",
					$timezone->Id,
					$timezone->BaseUtcOffset,
					$timezone->DaylightName,
					$timezone->StandardName,
					addslashes( $timezone->DisplayName ),
					$timezone->SupportsDaylightSavingsTime
				));
			}
		}

	}

	// Retrieve list of available time zones in the NCCP API
	public function get_time_zones () {

		$timezones = $this->measurements_client->ObtainTimeZones();
		return ! empty( $timezones ) ? $timezones->ObtainTimeZonesResult->TimeZoneInformation : false;

	}

	// Get the current list of available sensors
	public function get_sensors () {

		$sensors = $this->measurements_client->ListLogicalSensorInformation();		
		return ! empty( $sensors ) ? $sensors->ListLogicalSensorInformationResult->LogicalSensor : false;

	}

	public function convert_from ( $unit_id ) {

		$id = $this->uri->segment( 3 ) ? $this->uri->segment( 3 ) : $unit_id;

		$conversions = $this->measurements_client->ListAvailableConversionsFrom( array( 'originalUnitId' => $id ) );

		print_r( $conversions );

		return ! empty( $conversions ) ? $conversions->ListAvailableConversionsFromResult->MeasurementUnit : false;

	}

	public function convert_to ( $unit_id ) {

		$id = $this->uri->segment( 3 ) ? $this->uri->segment( 3 ) : $unit_id;

		$conversions = $this->measurements_client->ListAvailableConversionsTo( array( 'newUnitId' => $id ) );
		
		print_r( $conversions );

		return ! empty( $conversions ) ? $conversions->ListAvailableConversionsToResult->MeasurementUnit : false;

	}

}
