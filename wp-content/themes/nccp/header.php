<?php
// Page header.  This is called with get_header and loads all of the below plus calling wp_head last
?>
<!DOCTYPE html>

<!--[if IE 8]>
<html id="ie8">
<![endif]-->

<!--[if !(IE 8) ]><!-->
<html>
<!--<![endif]-->

<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">

<title>NCCP Mobile</title>

<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

<!-- Other theme JS includes are in functions -->

<!--[if lt IE 9]>
	<script src="<?php echo get_template_directory_uri(); ?>/js/html5.js" type="text/javascript"></script>
<![endif]-->

<!--[if lte IE 8]>
	<script src="<?php echo get_template_directory_uri(); ?>/js/excanvas.min.js" type="text/javascript"></script>
<![endif]-->

<?php wp_head(); ?>

</head>

<body <?php body_class(); ?>>

	<div id="background"><img src="<?php echo get_template_directory_uri(); ?>/img/bg.jpg" border="0" /></div>

	<div id="page" data-role="page">

		<header id="header" data-role="header">
			<div id="logo">
				<a href="<?php echo home_url(); ?>/" data-role="button" data-transition="slidefade"><img src="<?php echo get_template_directory_uri(); ?>/img/logo.png" border="0" /></a>
			</div>
			<div id="main-navigation">
				<ul id="menu-main-navigation" class="menu">
					<?php 
					class menu_walker extends Walker_Nav_Menu {						
						private $prev = null;
						private $next = null;

						function __construct () {
							global $post; // Current content
							$post_url = get_permalink( $post->ID );

							$current = null;

							// Get all the menu items so we can tell if a page has a previous/next for prefetching purposes
							$menu_items = wp_get_nav_menu_items( 'Main Navigation' );						

							// Strip the item IDs out into their own array of linear menu item IDs
							array_walk( $menu_items, function ( $item, $index ) use ( $post_url, &$current ) {
								if ( $item->url == $post_url ) // This is the current menu item
									$current = $index;
							});

							if ( $current > 0 ) $this->prev = $menu_items[ $current - 1 ];
							if ( $current < count( $menu_items ) - 1 ) $this->next = $menu_items[ $current + 1 ];
						}

						function start_el (  &$output, $item ) {
							// Basic menu template:
							//<li id="menu-item-78" class="menu-item menu-item-type-post_type menu-item-object-page current-menu-item page_item page-item-21 current_page_item menu-item-78">
							//<a href="http://nccp.local/contact/">Contact</a>

							// Deal with the previous/next items of the current page if they exist
							if ( $this->prev && $item->ID == $this->prev->ID )
								$prev = true;

							if ( $this->next && $item->ID == $this->next->ID )
								$next = true;		

							$output .= sprintf( 
								'<li id="menu-item-%d" class="menu-item menu-item-%d page-item page-item-%d %s">
									<a href="%s" data-transition="%s" class="%s" %s>%s</a>',
								$item->ID,
								$item->ID,
								$item->ID,
								$item->current ? 'current-page-item' : '',
								$item->url,
								'slidefade',
								isset( $prev ) ? 'page-prev' : ( isset( $next ) ? 'page-next' : '' ),
								isset( $prev ) || isset( $next ) ? 'data-prefetch' : '',
								$item->title
							); 
						}
					}

					wp_nav_menu( array( 'menu' => 'Main Navigation', 'walker' => new menu_walker ) );
					?>					
				</ul>
			</div>
		</header>


		<div id="main" data-role="content">
