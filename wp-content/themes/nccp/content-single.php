<?php
/**
 * Sub-template for displaying post content
 *
 * @package WordPress
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header">
		<h1 class="entry-title"><?php the_title(); ?></h1>

		<?php if ( 'post' == get_post_type() ) : ?>
		<?php endif; ?>
	</header><!-- .entry-header -->

	<div class="entry-content">
		<?php the_content(); ?>
		<?php wp_link_pages( array( 'before' => '<div class="page-link"><span>' . __( 'Pages:', 'twentyeleven' ) . '</span>', 'after' => '</div>' ) ); ?>
	</div><!-- .entry-content -->

	<footer class="entry-meta">		
		<div id="author-info">
			<div id="author-description">
				<p>Posted by <?php echo get_the_author(); ?> @ <?php the_time(); ?></p>
			</div><!-- #author-description -->
		</div><!-- #author-info -->
	</footer><!-- .entry-meta -->
</article><!-- #post-<?php the_ID(); ?> -->
