// Global templates for PixelPerfect.js
// Requires underscore.js

nccp = {}; // Global namespace for sharing

nccp.templates = {

	data_table: ' \
	<div class="sensor"> \
		<div class="sensor-info collapse-trigger"> \
			<div class="id">Sensor <%= sensor_id %>: <%= sensor_name %></div> \
		</div> \
		<table class="data table table-bordered table-striped table-hover"> \
			<thead> \
				<tr> \
					<th>Timestamp</th> \
					<th>Value</th> \
				<tr> \
			</thead> \
			<tbody> \
				<% _.each( sensor, function ( row ) { %> \
				<tr> \
					<td class="timestamp"><%= row.timestamp %></td> \
					<td class="value"><%= row.value %></td> \
				</tr> \
				<% }); %> \
			</tbody> \
		</table> \
	</div> \
	',

	loading: ' \
		<div id="followingBallsG" class="loading"> \
			<div id="followingBallsG_1" class="followingBallsG"></div> \
			<div id="followingBallsG_2" class="followingBallsG"></div> \
			<div id="followingBallsG_3" class="followingBallsG"></div> \
			<div id="followingBallsG_4" class="followingBallsG"></div> \
		</div> \
	'
};
