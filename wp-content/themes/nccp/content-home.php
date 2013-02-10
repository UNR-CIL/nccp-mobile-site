<?php
/**
 * Sub-template for displaying home content - called from index
 *
 * @package WordPress
 */
?>

<div class="divider"><div class="divider-bottom"></div></div>

<div class="home-banner">
	Welcome to the Nevada Climate Change Portal
</div>

<div class="divider dark"><div class="divider-bottom"></div></div>

<div id="main-content">
	<div class="column main">
		<?php the_content(); ?>
	</div>
	<div class="column sidebar">
		<?php get_sidebar( 'home' ); ?>
	</div>	
</div>

<div class="divider"><div class="divider-bottom"></div></div>

<svg id="testvg"></svg>

Numbers!

Graphs!

<div class="divider"><div class="divider-bottom"></div></div>

<div id="gmap-container" class="content-container">
	<h2>Or Get Data By Location</h2>
	<div id="gmap"></div>
</div>
