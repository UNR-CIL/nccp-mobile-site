<?php
/**
 * The template used for displaying page content in page.php
 *
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
