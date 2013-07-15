<?php
/**
 * The Template for displaying all single posts.
 *
 * @package WordPress
 */

get_header(); ?>

		<div id="primary">
			<div id="content" role="main">

				<?php while ( have_posts() ) : the_post(); ?>

					<nav id="nav-single">
						<h3 class="assistive-text"><?php _e( 'Post navigation', 'twentyeleven' ); ?></h3>
						<span class="nav-previous"><?php previous_post_link( '%link', __( '<span class="meta-nav">&larr;</span> Previous', 'twentyeleven' ) ); ?></span>
						<span class="nav-next"><?php next_post_link( '%link', __( 'Next <span class="meta-nav">&rarr;</span>', 'twentyeleven' ) ); ?></span>
					</nav><!-- #nav-single -->

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

				<?php endwhile; // end of the loop. ?>

			</div><!-- #content -->
		</div><!-- #primary -->

<?php get_footer(); ?>