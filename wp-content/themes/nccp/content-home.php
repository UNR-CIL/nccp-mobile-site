<?php
/**
 * The template used for displaying page content in page.php
 *
 * @package WordPress
 */
?>

<div class="home-banner">
	Welcome to the Nevada Climate Change Portal
</div>

<div class="divider"><div class="divider-bottom"></div></div>

<div id="main-content">
	<div class="column main">
		<?php the_content(); ?>
	</div>
	<div class="column sidebar">
		<?php get_sidebar( 'home' ); ?>
	</div>	
</div>

<div class="divider"><div class="divider-bottom"></div></div>

<div id="flot-container" class="content-container">
	<h2>A Few Numbers</h2>
	<div id="flot-1" class="flot"></div>
	<div id="flot-2" class="flot"></div>
	<div id="flot-3" class="flot"></div>
</div>

<div class="divider"><div class="divider-bottom"></div></div>

<div id="gmap-container" class="content-container">
	<h2>Or Get Data By Location</h2>
	<div id="gmap"></div>
</div>
