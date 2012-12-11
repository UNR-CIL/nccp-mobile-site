<?php
/**
 * The Sidebar containing the main widget area.
 *
 * @package WordPress
 */

?>
		<div id="sidebar" class="home">

			<h2>What's Happening</h2>

			<div class="divider"><div class="divider-bottom"></div></div>
			
			<div class="sidebar-posts">
				<?php
				$myposts = get_posts();
				foreach( $myposts as $post ) :	setup_postdata($post); ?>
					<div class="sidebar-post">
						<li class="sidebar-post-title">
							<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
						</li>

						<div class="sidebar-post-excerpt">
							<div class="sidebar-post-date"><?php the_date(); ?></div>							
							<?php the_excerpt(); ?> 
							<a href="<?php the_permalink(); ?>" class="read-more">Read More &raquo;</a>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
			
		</div>
