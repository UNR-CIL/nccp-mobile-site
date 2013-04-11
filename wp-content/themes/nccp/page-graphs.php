<?php
/**
 * The template for displaying all pages.
 *
 * @package WordPress
 * 
 * Template Name: Graphs
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
					if ( isset( $_GET['sensor_ids'] ) ) {
						$sensor_ids = $_GET['sensor_ids'];

						if ( ! $sensors = get_sensor_data( $sensor_ids, '2012-01-01', '2012-06-01', 100, 'hourly' ) ) {
							$msg = "Could not retrieve sensor information.";
						}
					} else {
						$msg = "Must send valid array of sensor IDs.";
					}
					//$sensor_ids = array( 2, 7, 10 );
					//$sensors = get_sensor_data( $sensor_ids, '2012-01-01', '2013-01-01', 100, 'hourly' );
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
							
							<?php if ( isset( $sensors ) ) { ?>

							<div id="sensor-data">
								<?php foreach ( $sensor_ids as $sensor_id ) { ?>

									<h2>Sensor <?php echo $sensor_id; ?></h2>

									<?php if ( ! empty( $sensors->sensor_data->$sensor_id ) ) { ?>
									<table class="sensor-data-table">
										<?php foreach ( $sensors->sensor_data->$sensor_id as $row ) { ?>							
										<tr>
											<td><?php echo $row->timestamp; ?><td>
											<td><?php echo $row->value; ?><td>
										</tr>
										<?php } ?>									
									</table>
									<?php } else { ?>

									<h2 class="error">No data available for this sensor.</h2>
									
									<?php } ?>

								<?php } ?>
							</div>

							<?php } ?>												

						</div>
						
					</div>

				<?php endwhile; // end of the loop. ?>

			</div><!-- #content -->
		</div><!-- #primary -->

<?php get_footer(); ?>