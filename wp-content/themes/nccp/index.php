<?php
/*
 * Template Name: Home
 * Description: The homepage template
 */
?>

<?php get_header(); ?>

		<?php if ( have_posts() ) : ?>

			<?php while ( have_posts() ) : the_post(); ?>

				<div class="main-content home">

					<?php the_content(); ?>
					
				</div>

			<?php endwhile; ?>

		<?php else : ?>

			<div class="text-error">Page content not found.</div>

		<?php endif; ?>

<?php get_footer(); ?>