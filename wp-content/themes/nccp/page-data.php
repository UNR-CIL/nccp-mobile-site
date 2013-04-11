<?php
/**
 * The template for displaying all pages.
 *
 * @package WordPress
 * 
 * Template Name: Data
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

							<form id="data-selectors" name="data-selectors">
							
								<div class="data-form" data-role="collapsible-set">

									<div data-role="collapsible" data-theme='a'>
										<h2>Properties</h2>
										
										<div data-role="fieldcontain" class="data-properties">
										    <fieldset data-role="controlgroup">
											   <legend>Data properties:</legend>

											   <?php foreach ( $properties as $p ) { ?>
											   <label class="data-checkbox"><input type="checkbox" value="<?php echo $p->property_id; ?>" /> <?php echo $p->name; ?> </label>
											   <?php } ?>
										    </fieldset>
										</div>
										
									</div>
									
									<div data-role="collapsible" data-theme='a'>
										<h2>Data Sites</h2>
										
										<div data-role="fieldcontain" class="data-sites">
										    <fieldset data-role="controlgroup">
											   <legend>Data sites:</legend>

											   <?php foreach ( $sites as $s ) { ?>
											   <label class="data-checkbox"><input type="checkbox" name="data-sites" id="data-sites" value="<?php echo $s->site_id; ?>" /> <?php echo $s->site_name; ?> </label>
											   <?php } ?>
										    </fieldset>
										</div>
									</div>

									<div data-role="collapsible" data-theme='a'>
										<h2>Measurement Types</h2>
										
										<div data-role="fieldcontain" class="data-measurements-types" data-theme='a'>
										    <fieldset data-role="controlgroup" data-theme='a'>
											   <legend>Measurement types:</legend>
											   
											   <?php foreach ( $types as $t ) { ?>
											   <label class="data-checkbox" data-theme='a'><input type="checkbox" value="<?php echo $t->type_id; ?>" /> <?php echo $t->name; ?> </label>
											   <?php } ?>
										    </fieldset>
										</div>
									</div>

								</div>

								<p>
									In addition, data can be filtered by date/time if desired:
								</p>

								<div data-role="controlgroup" data-type="horizontal">
									<input data-icon="data-icon-date" type="button" class="data-button" id="data-filter-date" name="data-filter-date" value="Filter by Date" data-theme='a'>
									<input data-icon="data-icon-time" type="button" class="data-button" id="data-filter-date" name="data-filter-date" value="Filter by Time" data-theme='a'>
								</div>

								<p>
									Finally, choose how you would like to view the retrieved data:
								</p>			

								<div data-role="controlgroup" data-type="horizontal" data-theme='a'>
									<input data-icon="data-icon-view" type="button" class="data-button" id="data-view-download" name="data-filter-date" value="View in Browser" data-theme='a'>
									<input data-icon="data-icon-graph" type="button" class="data-button" id="data-view-graph" name="data-filter-date" value="Graph Data" data-theme='a'>
									<input data-icon="data-icon-download" type="button" class="data-button" id="data-view-download" name="data-filter-date" value="Download Data" data-theme='a'>
								</div>

							</form>

						</div>
						
					</div>

				<?php endwhile; // end of the loop. ?>

			</div><!-- #content -->
		</div><!-- #primary -->

<?php get_footer(); ?>