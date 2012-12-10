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

<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

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

	<div id="page">

		<header id="header">
			<div id="logo">
				<a href="<?php home_url(); ?>"><img src="<?php echo get_template_directory_uri(); ?>/img/logo.png" border="0" /></a>
			</div>
			<div id="main-navigation">
				<?php wp_nav_menu( 'Main Navigation' ); ?>
			</div>
		</header>


		<div id="main">
