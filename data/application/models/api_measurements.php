
<?php

// Raw calls from the NCCP API - Measurements service
// Note that most of these tend to be slow, so they generally
// shouldn't be called publicly, use the regular API class instead

class Api_measurements extends CI_Model {

	private $measurements_client;

	public function __construct () {

		parent::__construct();
		$this->load->database();

		$this->measurements_client = new SoapClient( $this->config->item('wsdl_path') . '/Measurement.svc' );

	}

	// Update the database with the current list of sensors
	public function update_sensors () {

		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor' ); // Blow out old sensor data before continuing
		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor_deployment' );
		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor_property' );
		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor_types' );
		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor_units' );
		$this->db->query( 'TRUNCATE TABLE ci_logical_sensor_relationships' );

		$sensors = $this->get_sensors();

		if ( ! empty( $sensors ) ) {
			foreach ( $sensors as $sensor ) {

				print_r( $sensor );

				// Format the sensor coordinates
				preg_match( "/\((.+)\s(.+)\s(.+)\)/i", $sensor->LocationWkt, $coords );
				
				// Insert the main sensor data
				$now = new DateTime();

				$this->db->query( sprintf(
					"INSERT INTO ci_logical_sensor VALUES ( NULL, %d, '%s', '%s', '%s', '%s', %d, '%s', NULL, NULL )",
					$sensor->Id,
					$sensor->MeasurementInterval,
					$coords[2],
					$coords[1],
					$coords[3],
					$sensor->SurfaceAltitudeOffset,
					$now->format( "Y-m-d H:i:s" )
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
					"INSERT IGNORE INTO ci_logical_sensor_property VALUES ( %d, '%s', '%s', %d, '%s' )",
					$sensor->MonitoredProperty->Id,
					addslashes( $sensor->MonitoredProperty->Description ),
					$sensor->MonitoredProperty->Name,
					$sensor->MonitoredProperty->System->Id,
					$sensor->MonitoredProperty->System->Name
				));

				// Insert Types info
				$this->db->query( sprintf(
					"INSERT IGNORE INTO ci_logical_sensor_types VALUES ( %d, '%s', '%s' )",
					$sensor->Type->Id,
					$sensor->Type->Name,
					$sensor->Type->Description
				));

				// Insert Unit info
				$this->db->query( sprintf(
					"INSERT IGNORE INTO ci_logical_sensor_units VALUES ( %d, '%s', %d, '%s', '%s' )",
					$sensor->Unit->Id,
					$sensor->Unit->Abbreviation,
					$sensor->Unit->Aspect->Id,
					$sensor->Unit->Aspect->Name,
					$sensor->Unit->Name
				));

				// Insert relationships info (how deployment, property, unit and type relate to each sensor)
				$this->db->query( sprintf(
					"INSERT INTO ci_logical_sensor_relationships VALUES ( NULL, %d, %d, %d, %d, %d )",
					$sensor->Id,
					$sensor->Deployment->Id,
					$sensor->MonitoredProperty->Id,
					$sensor->Type->Id,
					$sensor->Unit->Id
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
