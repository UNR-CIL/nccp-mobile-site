
<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// This controller exists to provide external access to the Measurements model
// for purposes of updating the list of timezones and logical sensors

class Measurements extends CI_Controller {

	public function __construct () {

		parent::__construct();

		$this->load->model('Api_measurements');
		
	}

	// Update the database with the current list of sensors
	public function update_sensors () {			

		$this->Api_measurements->update_sensors();

	}

	// Update the current list of available timezones
	public function update_timezones () {

		$this->Api_measurements->update_timezones();

	}

}
