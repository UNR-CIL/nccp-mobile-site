<?php
/**
 * The template for displaying all pages.
 *
 * @package WordPress
 * 
 * Template Name: Data Graphs
 */

get_header(); ?>

		<div id="primary">
			<div id="content" role="main">

				<?php while ( have_posts() ) : the_post(); ?>

					<?php
					/**
					 * Sub-template for displaying page content - called in page
					 * @package WordPress
					 */

					// Gonna need the wp database
					global $wpdb;

					// Check if sensor_ids exist.  If so, let loose the dogs of... data or something
					/*if ( isset( $_GET['sensor_ids'] ) ) {
						$sensor_ids = $_GET['sensor_ids'];
						$csv = isset( $_GET['csv'] ) ? true : false;

						if ( ! $sensors = get_sensor_data( $sensor_ids, '2012-01-01', '2012-06-01', 100, 'hourly', $csv ) ) {
							$msg = "Could not retrieve sensor information.";
						}
					} else {
						$msg = "Must send valid array of sensor IDs.";
					}*/
					$sensor_ids = array( 2, 7, 10 );
					$sensors = get_sensor_data( $sensor_ids, '2012-01-01', '2013-01-01', 100, 'hourly' );
					?>

					<div id="main-content">
						<header class="entry-header">
							<h1 class="entry-title"><?php the_title(); ?></h1>
						</header>

						<div class="entry-content">

							<?php the_content(); ?>

							<?php if ( isset( $msg ) ) { ?>

							<h2 class="error"><?php echo $msg; ?></h2>

							<?php } ?>

							<div class="sensor-info">
								<h2>Sensors:</h2>

								<ul class="sensor-list">
									<?php foreach( $sensor_ids as $sensor ) { ?>
									<li class="sensor"><?php echo $sensor; ?></li>
									<?php } ?>
								</ul>

								<h3 class="sensor-start-time">Start time: 2012-01-01</h3>
								<h3 class="sensor-end-time">End time: 2012-06-01</h3>
							</div>

							<style type="text/css">
								path {
								    stroke: steelblue;
								    stroke-width: 2;
								    fill: none;
								}

								line {
								    stroke: black;
								}

								text {
								    font-family: Arial;
								    font-size: 9pt;
								}
							</style>
							
							<svg class="graph"></svg>	

							<script type="text/javascript">
								var data = [
									{ value: 3, timestamp: '2012-01-01T08:00:00.000Z' }, 
									{ value: 6, timestamp: '2012-01-01T09:00:00.000Z' }, 
									{ value: 2, timestamp: '2012-01-01T10:00:00.000Z' }, 
									{ value: 7, timestamp: '2012-01-01T11:00:00.000Z' }, 
									{ value: 5, timestamp: '2012-01-01T13:00:00.000Z' }, 
									{ value: 2, timestamp: '2012-01-01T14:00:00.000Z' }, 
									{ value: 1, timestamp: '2012-01-01T15:00:00.000Z' }, 
									{ value: 3, timestamp: '2012-01-01T16:00:00.000Z' }, 
									{ value: 8, timestamp: '2012-01-01T17:00:00.000Z' }, 
									{ value: 9, timestamp: '2012-01-01T18:00:00.000Z' }, 
									{ value: 2, timestamp: '2012-01-01T19:00:00.000Z' }, 
									{ value: 5, timestamp: '2012-01-01T20:00:00.000Z' }, 
									{ value: 7, timestamp: '2012-01-01T21:00:00.000Z' }
									],
									w = 400,
									h = 200,
									margin = 20,
									start = new Date('2012-01-01T08:00:00.000Z'),
									end = new Date('2012-01-01T21:00:00.000Z'),
									y = d3.scale.linear().domain([0, d3.max(data, function ( d ) { return d.value; })]).range([0 + margin, h - margin]),
									x = d3.scale.linear().domain([ start, end ]).range([0 + margin, w - margin]),
									x_axis = d3.scale.linear().domain([ 0, data.length ]).range([0 + margin, w - margin]);


								var g = d3.select('.graph').append("svg:g").attr("transform", "translate(0, 200)");

								var line = d3.svg.line()
								    .x(function( d, i ) { return x(new Date( d.timestamp )); })
								    .y(function( d ) { return -1 * y(d.value); });

								
								g.append("svg:path").attr("d", line(data));

								g.append("svg:line")
								    .attr("x1", x_axis(0))
								    .attr("y1", -1 * y(0))
								    .attr("x2", x_axis(w))
								    .attr("y2", -1 * y(0))
								 
								g.append("svg:line")
								    .attr("x1", x_axis(0))
								    .attr("y1", -1 * y(0))
								    .attr("x2", x_axis(0))
								    .attr("y2", -1 * y(d3.max(data, function ( d ) { return d.value; })));

								g.selectAll(".xLabel")
								    .data(x.ticks(5))
								    .enter().append("svg:text")
								    .attr("class", "xLabel")
								    .text(String)
								    .attr("x", function(d) { return x(d) })
								    .attr("y", 0)
								    .attr("text-anchor", "middle")
								 
								g.selectAll(".yLabel")
								    .data(y.ticks(4))
								    .enter().append("svg:text")
								    .attr("class", "yLabel")
								    .text(String)
								    .attr("x", 0)
								    .attr("y", function(d) { return -1 * y(d) })
								    .attr("text-anchor", "right")
								    .attr("dy", 4);
							</script>											

						</div>
						
					</div>

				<?php endwhile; // end of the loop. ?>

			</div><!-- #content -->
		</div><!-- #primary -->

<?php get_footer(); ?>