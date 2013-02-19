<?php
// Page footer.  This doesn't have to be the footer for all pages - it just usually is.
?>

	</div><!-- #main -->

	<footer id="footer" data-role="footer" data-position="fixed" class="container">
		<img id="footer-bg" src="<?php echo get_template_directory_uri(); ?>/img/footer-bg.png" border="0" />
		<a id="footer-logo" href="<?php echo home_url(); ?>/"><img src="<?php echo get_template_directory_uri(); ?>/img/logo-footer.png" border="0" /></a>
		<span class="footer-text">The Nevada Climate Change Portal</span>
		<div id="copyright">&copy; <span class="date"><?php echo date( 'Y' ); ?></span></div>
	</footer>	

</div><!-- #page -->



<?php wp_footer(); // This is always called last ?>

</body>
</html>