// Global templates for PixelPerfect.js
// Requires underscore.js

nccp = {}; // Global namespace for sharing

nccp.templates = {

	data_table: ' \
	<div id="sensor-<%= sensor_id %>" class="sensor"> \
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
			<tbody></tbody> \
			<tfoot> \
				<tr> \
					<td colspan="2"> \
						<input type="button" class="data-button btn btn-large btn-block load-more" value="Load More" /> \
					</td> \
				</tr> \
			</tfoot> \
		</table> \
	</div> \
	',

	data_table_row: ' \
				<tr <% if ( ! visible ) { %>style="display: none;"<% } %>> \
					<td class="timestamp"><%= timestamp %></td> \
					<td class="value"><%= value %></td> \
				</tr> \
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
