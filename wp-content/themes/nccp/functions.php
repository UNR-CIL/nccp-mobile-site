<?php

define( 'DATA_API_BASE', get_option( 'data_api_base' ) );

// Template functions.  This includes any logic which has to be handled globally
// (outside of page template) or defined globally.  This file is also used to hook
// in necessary styles and scripts for both the front and back ends.

//////////////////////////////////////////////////////////////////
// Callable theme functions //////////////////////////////////////
//////////////////////////////////////////////////////////////////

// Callable to check if browser is < 9
function is_IE () {
	$browser = get_browser();

	return $browser->browser == 'Internet Explorer' && $browser->version < 9 ? true : false;
}

//////////////////////////////////////////////////////////////////
// Theme code ////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

// Register scripts/styles with the proper authorities
 
add_action( 'wp_enqueue_scripts', 'theme_styles' ); // Front
add_action( 'wp_enqueue_scripts', 'theme_scripts' ); // Front

// Register menus

add_action( 'init', 'main_menus' );

// Register shortcodes

add_shortcode( 'people', 'shortcode_people' );
add_shortcode( 'participants', 'shortcode_participants' );

// Enable SVG support

add_filter( 'upload_mimes', 'add_svg' );

// IE support

if ( is_IE() ) {
	add_action( 'wp_enqueue_scripts', 'ie_theme_styles' );
	add_action( 'wp_enqueue_scripts', 'ie_theme_scripts' );
}

//////////////////////////////////////////////////////////////////
// Theme initialization functions ////////////////////////////////
//////////////////////////////////////////////////////////////////

// WP action functions

function main_menus () {

  	register_nav_menus(
		array( 'main-navigation' => __( 'Main Navigation' ) )
	);

}

// Global styles
function theme_styles () {

	wp_enqueue_style( 'bootstrap-css', get_stylesheet_directory_uri() . '/assets/bootstrap/css/bootstrap.min.css' );
	wp_enqueue_style( 'bootstrap-datepicker-css', get_stylesheet_directory_uri() . '/assets/css/bootstrap-datepicker.css' );
	wp_enqueue_style( 'bootstrap-timepicker-css', get_stylesheet_directory_uri() . '/assets/css/bootstrap-timepicker.min.css' );
	wp_enqueue_style( 'd3-nv-css', get_stylesheet_directory_uri() . '/assets/css/nv.d3.css' );
	wp_enqueue_style( 'style-main', get_stylesheet_directory_uri() . '/assets/css/application.css' );

}

function ie_theme_styles () {

	wp_enqueue_style( 'style-ie', get_stylesheet_directory_uri() . '/assets/css/application-ie.css' );

}

// Global scripts
function theme_scripts () {

	wp_enqueue_script( 'jquery-cdn', 'http://code.jquery.com/jquery-2.0.3.min.js', false, false, true );	
	wp_enqueue_script( 'jquery-simple-checkbox', get_stylesheet_directory_uri() . '/assets/js/jquery.simple-checkbox.js', array( 'jquery-cdn' ), false, true );
	wp_enqueue_script( 'd3', 'http://d3js.org/d3.v3.min.js', false, false, true );
	wp_enqueue_script( 'd3-nv', get_stylesheet_directory_uri() . '/assets/js/nv.d3.min.js', array( 'd3' ), false, true );
	wp_enqueue_script( 'bootstrap-js', get_stylesheet_directory_uri() . '/assets/bootstrap/js/bootstrap.min.js', array( 'jquery-cdn' ), false, true );
	wp_enqueue_script( 'bootstrap-datepicker', get_stylesheet_directory_uri() . '/assets/js/bootstrap-datepicker.js', array( 'jquery-cdn', 'bootstrap-js' ), false, true );
	wp_enqueue_script( 'bootstrap-timepicker', get_stylesheet_directory_uri() . '/assets/js/bootstrap-timepicker.min.js', array( 'jquery-cdn', 'bootstrap-js' ), false, true );
	wp_enqueue_script( 'templates', get_stylesheet_directory_uri() . '/assets/js/templates.js', false, false, true );
	wp_enqueue_script( 'underscore-local', get_template_directory_uri() . '/assets/js/underscore-min.js', array( 'jquery-cdn', 'd3', 'bootstrap-js', 'templates' ), false, true );
	wp_enqueue_script( 'backbone-local', get_template_directory_uri() . '/assets/js/backbone-min.js', array( 'underscore-local' ), false, true );
	wp_enqueue_script( 'application', get_template_directory_uri() . '/assets/js/application.js', array( 'backbone-local' ), false, true );

}

function ie_theme_scripts () {

	wp_enqueue_script( 'respond', get_template_directory_uri() . '/assets/js/respond/respond.min.js', false, true );

}

// Simple shortcode for displaying project people
function shortcode_people ( $atts ) {

	$organizations = array(
		'unr'	=> 'University of Nevada, Reno',
		'dri'	=> 'Desert Research Institute',
		'unlv'	=> 'University of Nevada, Las Vegas',
		'nsc'	=> 'Nevada State College',
		'ua'	=> 'University of Arizona',
		'uta'	=> 'University of Texas, Austin'
	);

	$people = new WP_Query( array (
		'post_type'	=> 'person',
		'nopaging'  => true,
		'order'		=> 'ASC'
	));

	if ( $people->have_posts() ): $first = true; ob_start(); ?>
	<ul class="people">
		<?php while ( $people->have_posts() ): $people->the_post(); ?>
		<li class="person bulletproof">
			<h3 class="thwomp <?php if ( ! $first == true ): ?>up<?php endif; $first = false; ?>"><?php the_title(); ?></h3>
			<div class="row-fluid">
				<div class="thumbnail span2">
					<img src="<?php echo types_render_field( 'people-thumbnail', array( 'raw' => true ) ); ?>" border="0" />
				</div>
				<div class="content span9">
					<h3><?php echo types_render_field( 'people-title', array( 'raw' => true ) ); ?></h3>
					<h4>
						<?php $orgs = explode( ', ', types_render_field( 'people-organization', null ) );
						foreach ( $orgs as $index => $org ) { echo $organizations[ $org ]; if ( $index != count( $orgs ) - 1 ) { echo ', '; } } ?>
					</h4>

					<h5>Component</h5>
					<p><?php echo ucfirst( str_ireplace( '-', ' ', types_render_field( 'people-component', null ) ) ); ?></p>

					<h5>Research areas</h5>
					<p><?php echo types_render_field( 'people-research-areas', array( 'raw' => true ) ); ?></p>

					<a href="<?php echo types_render_field( 'people-webpage', array( 'raw' => true ) ); ?>" target="_blank">Website</a> |
					<a href="<?php echo types_render_field( 'people-email', array( 'raw' => true ) ); ?>" target="_blank">Email</a>
				</div>	
			</div>
			
		</li>
		<?php endwhile; ?>
	</ul>
	<?php endif; wp_reset_postdata();

	$output = ob_get_contents();

	ob_end_clean();

	return $output;
}

// Simple shortcode for displaying project participants
function shortcode_participants ( $atts ) {

	$participants = new WP_Query( array (
		'post_type'	=> 'participant',
		'nopaging'  => true,
		'order'		=> 'ASC'
	));

	if ( $participants->have_posts() ): $first = true; ob_start(); ?>

	<ul class="participants">
		<?php while ( $participants->have_posts() ): $participants->the_post(); ?>
		<li class="participant bulletproof">
			<div class="row-fluid">
				<a href="<?php echo types_render_field( 'participant-url', array( 'raw' => true ) ); ?>" class="no-underline">
					<div class="thumbnail span2">
						<img src="<?php echo types_render_field( 'participant-thumbnail', array( 'raw' => true ) ); ?>" title="<?php the_title(); ?>" border="0" />
					</div>
				</a>
				<div class="content span9">
					<a href="<?php echo types_render_field( 'participant-url', array( 'raw' => true ) ); ?>" target="_blank"><?php the_title(); ?></a>
				</div>	
			</div>
			
		</li>
		<?php endwhile; ?>
	</ul>
	<?php endif; wp_reset_postdata();

	$output = ob_get_contents();

	ob_end_clean();

	return $output;

}

function add_svg ( $mimes ) {
	$mimes['svg'] = 'image/svg+xml';
	return $mimes;
}

/////////////////////////////////////////////////////////////////
// Classes //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// Custom menu building class
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
			'',//isset( $prev ) || isset( $next ) ? 'data-prefetch' : '',
			$item->title
		); 
	}
}
?>