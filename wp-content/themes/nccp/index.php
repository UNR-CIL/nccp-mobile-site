<?php
/*
 * Template Name: Home
 * Description: The homepage template
 */
?>

<?php get_header(); ?>

		<div id="primary">
			<div id="content" role="main">

			<?php if ( have_posts() ) : ?>

				<?php /* Start the Loop */ ?>
				<?php while ( have_posts() ) : the_post(); ?>

					<?php get_template_part( 'content', 'home' ); ?>

				<?php endwhile; ?>

			<?php else : ?>

				<div class="error">Page content not found.</div>

			<?php endif; ?>

			</div>
		</div>

<?php get_footer(); ?>