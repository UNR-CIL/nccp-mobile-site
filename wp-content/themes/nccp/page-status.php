<?php
/**
 * The template for displaying all pages.
 *
 * @package WordPress
 * Template Name: Status
 */
?>

<?php get_header(); ?>	

		<?php if ( have_posts() ) : ?>

			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'page' ); ?>

				<div id="status">
					<div id="nccp-status" class="status-block unknown">
						<div class="status-icon"></div>
						<div class="status-content">
							<div class="status-text">The NCCP website status is <b>unknown</b></div>
							<div class="status-date"></div>
						</div>
					</div>
					<div id="data-status" class="status-block unknown">
						<div class="status-icon"></div>
						<div class="status-content">
							<div class="status-text">The Data API status is <b>unknown</b></div>
							<div class="status-date"></div>
						</div>
					</div>
					<div id="measurement-status" class="status-block unknown">
						<div class="status-icon"></div>
						<div class="status-content">
							<div class="status-text unknown">The Measurement API status is <b>unknown</b></div>
							<div class="status-date"></div>
						</div>
					</div>
				</div>

			<?php endwhile; ?>

		<?php else : ?>

			<div class="error">Page content not found.</div>

		<?php endif; ?>

<?php get_footer(); ?>
