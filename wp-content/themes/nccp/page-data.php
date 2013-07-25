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
			<h1 class="entry-title"><?php the_title(); ?></h1>

			<div class="entry-content">

				<?php the_content(); ?>

				<form class="data-selectors">				
					<div class="data-sensor-search">
						<div class="data-form">

							<div>
								<h2 class="thwomp up">Sensor Properties</h2>
								
								<div class="data-properties data-list">
								    <fieldset>
									   <?php foreach ( $properties as $p ) { ?>
									   <label><input type="checkbox" value="<?php echo $p->property_id; ?>" /> <?php echo $p->name; ?> </label>
									   <?php } ?>
								    </fieldset>
								</div>								
							</div>
							
							<div>
								<h2 class="thwomp up">Sensor Sites</h2>
								
								<div class="data-sites data-list">
								    <fieldset >
									   <?php foreach ( $sites as $s ) { ?>
									   <label><input type="checkbox" name="data-sites" id="data-sites" value="<?php echo $s->site_id; ?>" /> <?php echo $s->site_name; ?> </label>
									   <?php } ?>
								    </fieldset>
								</div>
							</div>

							<div>
								<h2 class="thwomp up">Measurement Types</h2>
								
								<div class="data-measurements-types data-list">
								    <fieldset>									   
									   <?php foreach ( $types as $t ) { ?>
									   <label><input type="checkbox" value="<?php echo $t->type_id; ?>" /> <?php echo $t->name; ?> </label>
									   <?php } ?>
								    </fieldset>
								</div>
							</div>

						</div>

						<input type="button" class="data-button btn btn-large btn-block" id="data-sensor-search" value="Search" />
					</div>
				</form>

				<!-- Sensor search results -->

				<div class="data-sensor-search-results">
					<div class="table results">
						<!-- Populated after sensor search -->
					</div>
				</div>

				<!-- Filter results by date/time -->

				<div class="data-filter-date-time">
					<p>
						In addition, data can be filtered by date/time if desired:
					</p>

					<div class="btn-group">
						<input type="button" class="btn" id="data-filter-date" value="Filter by Date">
						<input type="button" class="btn" id="data-filter-time" value="Filter by Time">
					</div>

					<?php $now = new DateTime(); $then = clone $now; $then->sub( new DateInterval( 'P1Y' ) ); ?>
					<div class="filter-date">
						<div class="icon-date"><img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/sprites/half-calendar.png" border="0" /></div>
						<div class="input-group row">
							<span class="input-group-addon input-large span3">Start</span>
							<div id="date-start" type="text" class="input-large input-text" data-date-format="mm/dd/yyyy"><?php echo $then->format( 'm/d/Y' ); ?></div>
							<span class="input-group-addon input-large span3">End</span>
							<div id="date-end" type="text" class="input-large input-text" data-date-format="mm/dd/yyyy"><?php echo $now->format( 'm/d/Y' ); ?></div>
						</div>
					</div>

					<div class="filter-time">
						<div class="icon-time"><img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/img/sprites/half-clock.png" border="0" /></div>
						<div class="input-group bootstrap-timepicker">
							<span class="input-group-addon input-large">Time</span>
							<div id="time" type="text" class="input-large input-text">00:00</div>
						</div>
					</div>
				</div>

				<!-- Choose how data should be viewed -->

				<div class="data-view-options">
					<p>
						Finally, choose how you would like to view the retrieved data:
					</p>

					<div class="btn-group">
						<input type="button" class="data-button btn" id="data-view-sensor-data" value="View in Browser">
						<input type="button" class="data-button btn" id="data-view-graph" value="Graph Data">
						<input type="button" class="data-button btn" id="data-view-download" value="Download Data">
					</div>
				</div>

				<!-- Data output -->

				<div class="data-output">
					<div class="data-table">
						<!-- Populated dynamically -->
					</div>
					<div class="data-graphs">
						<!-- Populated dynamically -->
					</div>
				</div>

			</div>
			
		</div>

	<?php endwhile; // end of the loop. ?>

<?php get_footer(); ?>