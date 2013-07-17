// Global templates for PixelPerfect.js
// Requires underscore.js

nccp = {}; // Global namespace for sharing

nccp.templates = {

	data_table: ' \
	<div class="sensor"> \
		<div class="sensor-info collapse-trigger"> \
			<div class="id">Sensor <%= sensor_id %>: <%= sensor_name %></div> \
		</div> \
		<ul class="data table"> \
			<% _.each( sensor, function ( row ) { %> \
			<li><%= row.timestamp %> <span><%= row.value %></span></li> \
			<% }); %> \
		</ul> \
	</div> \
	'
};
