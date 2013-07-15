<?php
/**
 * The template for displaying all pages.
 *
 * @package WordPress
 * 
 * Template Name: Data
 */

get_header(); ?>		

	<?php while ( have_posts() ) : the_post(); ?>

		<?php
		/**
		 * Sub-template for displaying page content - called in page
		 * @package WordPress
		 */

		global $wpdb;

		// Get lists we need to build the data interface

		// Get the current list of properties				
		$properties = json_decode( file_get_contents( DATA_API_BASE . "get/sensors/properties" ) );

		// Get the current data sites
		$sites = json_decode( file_get_contents( DATA_API_BASE . "get/sensors/sites" ) );

		// Get measurement types
		$types = json_decode( file_get_contents( DATA_API_BASE . "get/sensors/types" ) );
		?>

		<div class="main-content page get-data">
			<header class="entry-header">
				<h1 class="entry-title"><?php the_title(); ?></h1>
			</header>

			<div class="entry-content">

				<?php the_content(); ?>

				<form class="data-selectors">				
					<div class="data-sensor-search">
						<div class="data-form">

							<div>
								<h2>Properties</h2>
								
								<div class="data-properties">
								    <fieldset>
									   <legend>Data properties:</legend>

									   <?php foreach ( $properties as $p ) { ?>
									   <label><input type="checkbox" value="<?php echo $p->property_id; ?>" /> <?php echo $p->name; ?> </label>
									   <?php } ?>
								    </fieldset>
								</div>
								
							</div>
							
							<div>
								<h2>Data Sites</h2>
								
								<div class="data-sites">
								    <fieldset >
									   <legend>Data sites:</legend>

									   <?php foreach ( $sites as $s ) { ?>
									   <label><input type="checkbox" name="data-sites" id="data-sites" value="<?php echo $s->site_id; ?>" /> <?php echo $s->site_name; ?> </label>
									   <?php } ?>
								    </fieldset>
								</div>
							</div>

							<div>
								<h2>Measurement Types</h2>
								
								<div class="data-measurements-types">
								    <fieldset>
									   <legend>Measurement types:</legend>
									   
									   <?php foreach ( $types as $t ) { ?>
									   <label><input type="checkbox" value="<?php echo $t->type_id; ?>" /> <?php echo $t->name; ?> </label>
									   <?php } ?>
								    </fieldset>
								</div>
							</div>

						</div>

						<input type="button" class="data-button btn btn-large btn-block" id="data-sensor-search" value="Search" />
					</div>

					<div class="data-sensor-search-results">
						<div class="table results">
							<!-- Populated after sensor search -->
						</div>
						<div id="get-data-group" class="btn-group">
							<input type="button" class="data-button btn" id="data-graph-sensor-data" value="Graph Sensor Data">
							<input type="button" class="data-button btn" id="data-view-sensor-data" value="View Sensor Data">
							<input type="button" class="data-button btn" id="data-download-sensor-data" value="Download Sensor Data CSV">
						</div>
					</div>

					<div class="data-filter-date-time">
						<p>
							In addition, data can be filtered by date/time if desired:
						</p>

						<div class="btn-group">
							<input type="button" class="btn" id="data-filter-date" value="Filter by Date">
							<input type="button" class="btn" id="data-filter-time" value="Filter by Time">
						</div>
					</div>

					<div class="data-view-options">
						<p>
							Finally, choose how you would like to view the retrieved data:
						</p>

						<div class="btn-group">
							<input type="button" class="data-button btn" id="data-view-download" value="View in Browser">
							<input type="button" class="data-button btn" id="data-view-graph" value="Graph Data">
							<input type="button" class="data-button btn" id="data-view-download" value="Download Data">
						</div>
					</div>
				</form>

				<!-- Data output -->

				<div id="data-output">
					<div class="data-table table">
						
					</div>
					<div class="data-graphs">
						
					</div>
				</div>

			</div>
			
		</div>

	<?php endwhile; // end of the loop. ?>

<?php get_footer(); ?>