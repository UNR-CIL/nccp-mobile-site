<?php
/*
Plugin Name: Easy FAQ with Expanding Text
Description: Easily create a Frequently Asked Questions page with answers that slide down when the questions are clicked. No need for a shortcode, HTML coding, or javascript tweaking.
Version: 3.1.5
Author: bgentry
Author URI: http://bryangentry.us
Plugin URI: http://bryangentry.us/easy-faq-page-with-expanding-text-wordpress-plugin/
*/

add_action( 'wp', 'determine_is_faq');

//this function determines whether the page or post being viewed, or one of the posts returned by the current query, should receive the animation effects.
function determine_is_faq() {
	global $wp_query;
	$loadfaq = 0; // set this at 0 to make sure it wasn't just hanging out with a value of 1 before
	//now let's go through each post in the query and see whether it needs the animations
	foreach ($wp_query->posts as $eachpost) {
		$id = $eachpost->ID;
		$faq_checkbox=get_post_meta($id, 'make_faq_page', true); //see whether the "make faq" check box was checked on this post
		$posa = false; // make sure these variables weren't hanging out with a value already
		$pos = false;
		$title = $eachpost->post_name; //test the post name for faq
		$pos = strpos($title, 'faq' );
		$posa = strpos($title, 'frequently-asked-questions' );
		if (is_int($pos) || $posa!==false || $faq_checkbox=='yes') //if this post needs the faq animations,
		$loadfaq = 1;												//set this variable so we can add the animations
	}
if ( $loadfaq == 1 ) {
			//if the current post, page, or one of the posts returned by the current query needs the animations....
			wp_enqueue_script('faqmaker', plugins_url( 'faqmaker.js' , __FILE__ ), array('jquery'));
			wp_enqueue_style( 'faqstyle', plugins_url( 'faqstyle.css' , __FILE__ ));
			add_filter( 'the_content', 'faq_filter',1 );
			add_action('wp_head', 'faq_css_output');
			add_action('get_footer', 'faq_footer');
	}
}

//output the styles for an FAQ page
	function faq_css_output() {
	$faqoptions = get_option('bg_faq_options');
	if( $faqoptions['visualcue'] == 'plusminus' ) {
		$closedimg = plugins_url( 'plussign.png', __FILE__ );
		$openedimg = plugins_url( 'minussign.png', __FILE__ );
		}
	elseif ( $faqoptions['visualcue'] == 'updown' ) {
		$closedimg = plugins_url( 'downarrow.png', __FILE__ );
		$openedimg = plugins_url( 'uparrow.png', __FILE__ );	
		}
		if( $closedimg ) {
		//if the user set up images to show...
			echo '
			<style type="text/css">
			.bg_faq_opened {
background-image: url("'.$openedimg.'");
padding-left:25px;
background-repeat: no-repeat;
}

.bg_faq_closed {
background-image: url("'.$closedimg.'");
padding-left:25px;
background-repeat: no-repeat;
} </style>';
		}
		unset($hsixstyle); //make sure this variable is empty  before we start evaluating whether to use it
	if ( $faqoptions['hsixsize'] )
		$hsixstyle = 'font-size:'.$faqoptions['hsixsize'].'!important;';
	if ( $faqoptions['hsixfont'] )
		$hsixstyle .= 'font-family:'.$faqoptions['hsixfont'].'!important;';
	if ( $faqoptions['hsixcolor'] )
		$hsixstyle .= 'color:'.$faqoptions['hsixcolor'].'!important;';
	if ( $hsixstyle ) {
			//display the styles for h6
			echo '<style type="text/css">h6 { '.$hsixstyle.'}</style>';
		}
	
	}


	
	//add the .bg_faq_content_section div around the countent
function faq_filter($content) {
	//first, we need to check again whether the current page needs the animation, so that the animation is not given unnecessarily to posts on an archive / index page
	global $post, $wp;
		$title = strtolower(get_the_title($post->ID));
		$posa = false; // make sure these variables start at false
		$pos = false;
		$pos = strpos($title, 'faq' );
		$posa = strpos($title, 'frequently asked questions' );
		$faq_checkbox=get_post_meta($post->ID, 'make_faq_page', true); //see whether the "make faq" check box was checked on this post
		if ($pos!==false || $posa!==false || $faq_checkbox=='yes') {
		//this code adds a script to call our javascript function with arguments set on the admin page
	$content = '<div class="bg_faq_content_section">'.$content;
		$content.='</div>';
		}
		return $content;
	}

//output the javascript to launch the animation at the bototm of the page	
function faq_footer() {
	$faqoptions = get_option('bg_faq_options');
	$foldup = $faqoptions['foldup'];
	echo '<script>bgfaq("'.$foldup.'")</script>';
	}
	
//and, let's set up that admin page now:
add_action('admin_menu', 'faq_admin_page');

function faq_admin_page() {
	add_menu_page('FAQ Admin Page', 'FAQ Admin Page',  'manage_options', 'faq_options_page', 'faq_options_page');
}

function faq_options_page() {
//lots of great admin stuff
?>
<h1>Create an interactive, animated FAQ page with the Easy FAQ with Expanding Text plugin by bGentry.</h1>
<p>This plugin turns a standard WordPress page into a dynamic animated page that reveals and hides content when readers click headings. Originally created to make user-friendly, animated frequently asked questions pages, it now supports this functionality on any kind of page or post.</p>
<h2>Here's How...</h2>
<img src="<?php echo plugins_url( 'faq_checkbox.png' , __FILE__ ); ?>" style="float:right; margin: 0 20px; border:1px solid #aaa"/>
<p><strong>First</strong>, create a page or post and give it this animated functionality. There are two ways to give it the functionality: The easiest and most dependable way is to check the checkbox on the editor screen beneath the title "Make Animated Dropdown Text." (This box should be beneath the box with the button to save the post.) On pages (not posts), an alternate way is to include "FAQ" or "Frequently Asked Questions" somewhere in the title. (This was the original method when the plugin was created, and is still supported at this time.)</p>
<img src="<?php echo plugins_url( 'faq_heading.png' , __FILE__ ); ?>" style="float:left; margin: 5px 10px; border:1px solid #aaa"/>
<p><strong>Second</strong>, type your questions and answers.</p>
<p>You indicate questions and answers via formatting that is built into the WordPress editor. Format questions as any kind of heading <strong>other than h6</strong>, and format answers as anything else. Paragraphs, lists, videos, photos, all work in most cases. Heading 6 is reserved to allow you to create content that does not receive the show/hide effects. (See "Troubleshooting" section below.)</p>
<p><strong>Third</strong>, save the page, then view it.</p>
<p>The plugin creates the accordian FAQ functionality on headings and paragraphs in the page content. It will not affect headings and paragraphs in the sidebar or other parts of the page.</p>
<p>The plugin allows you to choose whether the page should have only one question open at a time, and also choose a visual cue that will appear to the left of questions to signal that they will expand content underneath them when clicked.</p><h2>See below to set options for this plugin and read troubleshooting tips.</h2>
<div style="clear:both;"></div>
<div style="float:right; width:35%; margin: 0px 2% 0px 2%; padding:10px; background-color:#c6ece8; border-radius:20px;">
<h1>Please consider donating</h1>
<p>Has this plugin helped you make your website better? Was it easy to use?</p>
<p>I wrote this plugin because WordPress and its users deserved an easy way to make animated FAQ pages, and then I expanded it to work on other pages and posts, too, at the request of several users. Please consider supporting the development of this plugin and other plugins by making a donation here.</p>
<form action="https://www.paypal.com/cgi-bin/webscr" method="post">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="hosted_button_id" value="YF26W5P9QYPWG">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
</form>
<p>Also, I would appreciate your support by <a href="http://wordpress.org/extend/plugins/easy-faq-with-expanding-text/" target="_blank" title="Plugin Page on WordPress.org">rating the plugin on WordPress.org</a> or reviewing / featuring it on your blog. Contact me at bryangentry@gmail.com with questions.</p>
<p>If you'd like to work with me on a project or have me do some freelance programming for you, e-mail me at the above address.</p>
</div>
<div style="border-radius: 20px; background-color: #ecd5c6; padding:10px; margin: 0px 2% 0px 50px; width: 53%;">
<form action='options.php' method='post'>
<?php
settings_fields('faq_settings');
do_settings_sections('faq_section');?>
<input name='submit' type='submit' value='Save FAQ Settings' class="button" style="background-color:#c6ece8; padding:10px; height:40px;"/>
</form>
</div>
<div style="float:left; width:35%; margin: 20px 2% 0px 50px; padding:10px; background-color:#c6ece8; border-radius:20px;">
<h1>Troubleshooting / How to</h1>
<h2>I want to...</h2>
<h3>Have a call-to-action button at the bottom of my FAQ list</h3>
<p>To include a call-to-action or buy now button at the bottom of the list, you need to make it a Heading 6. Insert the button using the WordPress editor. Highlight it, then choose Heading 6 from the drop-down formatting menu.</p>
<h3>Have some sections of the page that don't receive the animated effects</h3>
<p>This is helpful if you want to divide the page into sections on different topics, or if you want some "closing paragraphs" at the end. Just put in one line that is formatted as a Heading 6 using the drop-down formatting menu. Everything that appears after this line will not receive the animated effects, until you start a new set with the animated effects by having another line that is another heading, such as heading 1.
<h3>Change the way heading 6 looks</h3>
<p>I chose heading 6 as the heading that does not receive the animated effects because it seems less likely that someone would be using it. If you don't like the way heading6 appears in your theme, you can try overriding the styles using the Heading 6 Styles options lised in the options box above</p>
<h2>If the plugin is not working...</h2>
<h3>Ensure that you are assigning the animation features to your page correctly</h3>
<p>The plugin will only activate on pages and posts for which it is activated. I recommend using the checkbox in the "Make Animated FAQ Page" box that appears on each post / page / custom post type editing screen. If you choose the other method of making it an FAQ page, including "FAQ" or "Frequently Asked Questions," make sure you are using this on a page, not another post type, and make sure faq or frequently-asked-questions is included in the page's permalink.</p>
<h3>Make sure javascript is working and loading</h3>
<p>This plugin requires browsers to have javascript turned on. If javascript is disabled in the browser, the page will display with all content displayed and will have no animations.</p>
<p>If javascript is enabled on the browser and the plugin isn't working correctly, view the page's source and look to see whether faqmaker.js is loaded. If not, then you need to double check that you are assigning the animation features to the page. (See previous troubleshooting tip.)
</div>

<div style="border-radius: 20px; background-color: #ecd5c6; padding:10px; margin: 20px 2%; width: 50%; float:right;">
<h1>About the plugin author</h1>
<p>My name is <a href="http://bryangentry.us">Bryan Gentry</a>. I'm a writer by day and a web designer and programmer by night.</p>
<p>I covered business for a local newspaper for four years after college, then I ran the blog and wrote marketing materials for a private liberal arts college. I have written copy for various websites, including websites I was designing.</p>
<p>I design websites with WordPress and I enjoy making them work better and look better, too. </p>
<p>I balance all this work with family life. My wife is one of my best web design critics. My son is too young to critique my work, but he provides great motivation to do good work, and lots of it!</p>
<h2>Contact Me:</h2>
<p>For support on this plugin, ask me a question, or to work with me on a project, <a href="http://bryangentry.us/contact-me">visit my contact page</a>.</p>
</div>

<?php
}
	
add_action('admin_init', 'faq_admin_init');
function faq_admin_init(){
register_setting( 'faq_settings', 'bg_faq_options');
add_settings_section('faq_settings_section', 'FAQ Plugin Settings', 'faq_get_content_div_class', 'faq_section');
}

function faq_get_content_div_class() {
$faqoptions = get_option('bg_faq_options');

echo '<p><label><strong>One answer open at a time?</strong>';
if($faqoptions['foldup'] == "yes")
	echo "<input name='bg_faq_options[foldup]' type='checkbox' value='yes' checked /> When users open one question, do you want all other opened answers to disappear as the new answer appears? Check here for yes.";
else
	echo "<input name='bg_faq_options[foldup]' type='checkbox' value='yes' /> When users open one question, do you want all other opened answers to disappear as the new answer appears? Check here for yes.";
echo '</label></p>';
echo '<h3>Visual Cues</h3>';
echo '<p>The plugin can place a visual cue next to the questions so your readers can know to click on them. Choose a visual cue:</p>';
$viscues = array( array('plusminus', 'Plus Sign and Minus Sign', 'plusminus.png'), array('updown', 'Up Arrow and Down Arrow', 'arrows.png'), array('none', 'None', 'none.png'));
foreach ( $viscues as $cue ) {
$checked = ( $faqoptions['visualcue'] == $cue[0] ) ? ' checked="checked"' : '';
	$imgfile = plugins_url( $cue[2], __FILE__ );
	echo '<label><input type="radio" name="bg_faq_options[visualcue]" value="'.$cue[0].'" '.$checked.'>'.$cue[1].'</input><img src="'.$imgfile.'" /></label><br/>'; 
}
echo '<h3>H6 Styles</h3><p>Heading 6 is the only heading that does not receive the animated effects. You will need it if you want to have certain sections of the page that do not receive this funcionality (such as a "Buy Now" button at the bottom). Use these if you want to override the way heading 6 appear in your theme. Use valid CSS, but don not end with a semicolon!</p>';
echo '<label><input type="text" name="bg_faq_options[hsixsize]" value="'.$faqoptions['hsixsize'].'"></input>Font size. <strong>Example:</strong> 20px or 2em</label><br/>';
echo '<label><input type="text" name="bg_faq_options[hsixfont]" value="'.$faqoptions['hsixfont'].'"></input>Font family. <strong>Example:</strong> "Times New Roman",Georgia,Serif</label><br/>';
echo '<label><input type="text" name="bg_faq_options[hsixcolor]" value="'.$faqoptions['hsixcolor'].'"></input>Font Color. <strong>Example:</strong> #aaffee</label><br/>';
 }
	
add_action('do_meta_boxes', 'add_faq_check_boxes');

function add_faq_check_boxes() {
$post_types=get_post_types();
foreach ($post_types as $type) {
	add_meta_box( 'faqcheck', 'Make Animated Dropdown Text', 'make_faq_check_box', $type, 'side', 'core', 1 );
}
}

function make_faq_check_box($post) {
	wp_nonce_field( 'faq_nonce_action', 'faq_nonce_name' );
	$checked=get_post_meta($post->ID, 'make_faq_page', true);
	$checked = ($checked=='yes' ? 'checked="checked"' :'');
	?>
	<p>Check this box and publish/update the page if you want to give this page's an accordian-style drop-down text effect, where users click headings to reveal additional content.</p>
	<input name="make_faq_page" type="checkbox" value="yes" <?php echo $checked; ?> ></input>
	<?php
}
add_action('save_post', 'save_faq_check_box');

function save_faq_check_box($post_id) {
// verify if this is an auto save routine. 
  // If it is our form has not been submitted, so we dont want to do anything
  if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
      return;

  // verify this came from the our screen and with proper authorization,
  // because save_post can be triggered at other times

  if ( !wp_verify_nonce( $_POST['faq_nonce_name'], 'faq_nonce_action' ) )
      return;

  
  // Check permissions
  if ( 'page' == $_POST['post_type'] ) 
  {
    if ( !current_user_can( 'edit_page', $post_id ) )
        return;
  }
  else
  {
    if ( !current_user_can( 'edit_post', $post_id ) )
        return;
  }

  // OK, we're authenticated: we need to find and save the data



  $faq = $_POST['make_faq_page'];
  update_post_meta( $post_id, 'make_faq_page', $faq);	
}	
?>