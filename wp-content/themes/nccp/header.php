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

<title><?php if ( $post->post_title ) { echo $post->post_title . ' - '; bloginfo( 'name' ); }?></title>

<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

<link href='http://fonts.googleapis.com/css?family=Oswald:400,300,700' rel='stylesheet' type='text/css'>

<?php wp_head(); ?>

</head>

<body <?php body_class(); ?> >

	<div class="container main">

		<header>

			<div id="ribbon" class="pull-right fluid">
				<a href="../status" alt="Site Status" title="Site Status">
					<img class="status-ribbon" border="0" src="<?php echo get_template_directory_uri(); ?>/assets/img/icons/status.png" border="0" />
				</a>
			</div>

			<div id="logo" class="fluid">
				<a href="<?php echo home_url(); ?>/"><img src="<?php echo get_template_directory_uri(); ?>/assets/img/sprites/header-bg-white.png" border="0" /></a>
			</div>

			<div class="navbar">
				<div class="navbar-bg"></div>
				<div class="container fluid">
				    <a class="brand" href="#">menu</a>

					<div class="nav-collapse collapse">
						<?php wp_nav_menu( array( 
							'menu' => 'Main Navigation', 
							'menu_class' => 'nav', 
							'depth' => 2 
						)); ?>	
					</div>

					<div class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
						<img src="<?php echo get_template_directory_uri(); ?>/assets/img/sprites/menu.png" border="0" />
				    </div>
				</div>
			</div>			
			
		</header>
