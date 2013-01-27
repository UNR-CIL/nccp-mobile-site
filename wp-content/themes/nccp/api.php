<?php
/*
 * Template Name: API
 * Description: Handles API interaction.  Superseded by /data interface.
 */
$measurements = new SoapClient( 'http://sensor.nevada.edu/Services/Measurements/Measurement.svc?wsdl' );

print_r( $measurements->__getFunctions() );

$data = new SoapClient( 'http://sensor.nevada.edu/Services/DataRetrieval/DataRetrieval.svc?wsdl' );

print_r( $data->__getFunctions() );
?>

Hello!