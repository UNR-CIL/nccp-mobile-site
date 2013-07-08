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
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>NCCP Mobile</title>

<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

<link href='http://fonts.googleapis.com/css?family=Oswald:400,300,700' rel='stylesheet' type='text/css'>

<?php wp_head(); ?>

</head>

<body <?php body_class(); ?> >

	<div id="page" class="container">

		<header id="header" class="">

			<div id="ribbon">
				<a href="../status">
					<img class="status-ribbon" border="0" src="<?php echo get_template_directory_uri(); ?>/assets/img/icons/status.png" border="0" />
				</a>
			</div>	

			<div id="logo">
				<a href="<?php echo home_url(); ?>/" data-transition="slidefade"><img src="<?php echo get_template_directory_uri(); ?>/assets/img/logo.png" border="0" /></a>
			</div>

			<?php //wp_nav_menu( array( 'menu' => 'Main Navigation', 'walker' => new menu_walker, 'depth' => 2 ) ); ?>
			
		</header>

			

		<div id="main">
