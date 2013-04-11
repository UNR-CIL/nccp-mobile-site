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

					if ( isset( $_GET['query'] ) ) {
						print_r( $_GET['query'] );
					}

					// Get lists we need to build the data interface

					// Get the current list of properties
					$properties = $wpdb->get_results( "SELECT property_id, description, name FROM ci_logical_sensor_property ORDER BY name" );

					// Get the current data sites
					$sites = $wpdb->get_results( "SELECT lat, lng, site_id, site_name FROM ci_logical_sensor_deployment GROUP BY site_name ORDER BY site_name" );

					// Get measurement types
					$types = $wpdb->get_results( "SELECT * FROM ci_logical_sensor_types ORDER BY name" );
					?>

					<div id="main-content">
						<header class="entry-header">
							<h1 class="entry-title"><?php the_title(); ?></h1>
						</header>

						<div class="entry-content">

							<?php the_content(); ?>

							

						</div>
						
					</div>

				<?php endwhile; // end of the loop. ?>

			</div><!-- #content -->
		</div><!-- #primary -->

<?php get_footer(); ?>