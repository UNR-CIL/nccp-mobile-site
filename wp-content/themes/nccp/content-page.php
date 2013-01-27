<?php
/**
 * Sub-template for displaying page content - called in page
 * @package WordPress
 */
?>

<div id="main-content">
	<header class="entry-header">
		<h1 class="entry-title"><?php the_title(); ?></h1>
	</header>

	<div class="entry-content">
		<?php the_content(); ?>
	</div>
</div>
