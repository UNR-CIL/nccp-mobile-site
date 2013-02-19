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
					<div id="nccp-status" class="status-block">
						<img src="<?php echo get_template_directory_uri(); ?>/img/icons/bad.png" class="status-icon" border="0" />
						<div class="status-content">
							<div class="status-text bad">The main NCCP website is <b>down</b></div>
							<div class="status-date">As of, 4:52pm</div>
						</div>
					</div>
					<div id="data-status" class="status-block">
						<img src="<?php echo get_template_directory_uri(); ?>/img/icons/good.png" class="status-icon" border="0" />
						<div class="status-content">
							<div class="status-text good">The main NCCP website is <b>up</b></div>
							<div class="status-date">As of, 4:52pm</div>
						</div>
					</div>
					<div id="measurement-status" class="status-block">
						<img src="<?php echo get_template_directory_uri(); ?>/img/icons/unknown.png" class="status-icon" border="0" />
						<div class="status-content">
							<div class="status-text unknown">The main NCCP website is <b>unknown</b></div>
							<div class="status-date">As of, 4:52pm</div>
						</div>
					</div>
				</div>

			<?php endwhile; ?>

		<?php else : ?>

			<div class="error">Page content not found.</div>

		<?php endif; ?>

<?php get_footer(); ?>
