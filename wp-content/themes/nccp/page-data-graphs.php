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
			<div id="content">

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
					} else {
						$msg = "Must send valid array of sensor IDs.";
					}

					// Test data
					//$sensor_ids = array( 2, 7, 10 );
					//$sensors = get_sensor_data( $sensor_ids, '2012-01-01', '2013-01-01', 100, 'hourly' );

					// Also get sensor info
					$sensor_info = get_sensor_info( $sensor_ids );
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

							<div id="data-graphs">

								<div class="sensor-info">
									<h3>Sensors:</h3>

									<ul class="sensor-data-table" data-role="listview" data-theme="a" data-inset="true">
										<?php foreach( $sensor_ids as $sensor_id ) { ?>
										<li class="sensor">
											<div class="left">Sensor ID: <?php echo $sensor_id; ?></div>
											<div class="right"><?php echo $sensor_info[$sensor_id]->property_name; ?></div>
										</li>
										<?php } ?>
									</ul>

									<h3>Period:</h3>
									<ul class="sensor-data-table" data-role="listview" data-theme="a" data-inset="true">
										<li class="sensor">
											<div class="left">Start Time:</div>
											<div class="right">2012-01-01</div>
										</li>
										<li class="sensor">
											<div class="left">End Time:</div>
											<div class="right">2012-06-01</div>
										</li>
									</ul>
								</div>

								<h3>Graphs:</h3>
								
								<div class="graphs">
									<?php foreach( $sensor_ids as $sensor_id ) { ?>
									<h4>Sensor <?php echo $sensor_id; ?>: <?php echo $sensor_info[$sensor_id]->property_name; ?></h4>

									<svg class="graph" id="graph-<?php echo $sensor_id; ?>"></svg>
									<?php } ?>

									<svg class="graph combined" id="graph-combined"></svg>
								</div>

								<div class="data-show-combined-wrapper">
									<input type="button" class="data-button" id="data-show-combined" name="data-show-combined" value="View Combined" data-theme='a'>
								</div>
								<div class="data-show-individual-wrapper">
									<input type="button" class="data-button" id="data-show-individual" name="data-show-individual" value="View Individual" data-theme='a'>
								</div>	

							</div>																		

						</div>
						
					</div>

				<?php endwhile; // end of the loop. ?>

			</div><!-- #content -->
		</div><!-- #primary -->

<?php get_footer(); ?>