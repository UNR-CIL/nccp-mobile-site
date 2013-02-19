<?php
/**
 * The template for displaying all pages.
 *
 * @package WordPress
 * Template Name: Page
 */
?>

<?php get_header(); ?>	

		<?php if ( have_posts() ) : ?>

			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'page' ); ?>

			<?php endwhile; ?>

		<?php else : ?>

			<div class="error">Page content not found.</div>

		<?php endif; ?>

<?php get_footer(); ?>
