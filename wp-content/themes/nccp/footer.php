<?php
// Page footer.  This doesn't have to be the footer for all pages - it just usually is.
?>

	</div><!-- #main -->

	<footer id="footer" data-role="footer" data-position="fixed" class="container">
		<img id="footer-bg" src="<?php echo get_template_directory_uri(); ?>/img/footer-bg.png" border="0" />
		<span class="footer-text">The Nevada Climate Change Portal <span style="font-size: 1.4em;">&copy;</span> <b><?php echo date( 'Y' ); ?></b></span>
	</footer>	

</div><!-- #page -->



<?php wp_footer(); // This is always called last ?>

</body>
</html>