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

				<div class="main-content page">
					<header class="entry-header">
						<h1 class="entry-title"><?php the_title(); ?></h1>
					</header>

					<div class="entry-content">
						<?php the_content(); ?>
					</div>
				</div>

			<?php endwhile; ?>

		<?php else : ?>

			<div class="error">Page content not found.</div>

		<?php endif; ?>

<?php get_footer(); ?>
