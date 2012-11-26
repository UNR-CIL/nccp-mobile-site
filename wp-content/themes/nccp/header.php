<!DOCTYPE html>
<!--[if IE 8]>
<html id="ie8">
<![endif]-->
<!--[if !(IE 8) ]><!-->
<html>
<!--<![endif]-->
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<title>NCCP Mobile</title>
<link rel="stylesheet" type="text/css" media="all" href="<?php echo get_bloginfo( 'stylesheet_url' ); ?>" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
<!--[if lt IE 9]>
<script src="<?php echo get_template_directory_uri(); ?>/js/html5.js" type="text/javascript"></script>
<![endif]-->
<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

<?php

if ( detect_mobile( true ) ) {
	echo "You're mobile!";
	print_r( detect_mobile( true ) );
} else
	echo "You're NOT mobile!";
?>

<div id="page">
	<header id="header"></header>


	<div id="main">
