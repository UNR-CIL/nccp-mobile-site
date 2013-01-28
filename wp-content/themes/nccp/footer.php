<?php
// Page footer.  This doesn't have to be the footer for all pages - it just usually is.
?>

	</div><!-- #main -->

	<footer id="footer" data-role="footer">
		<div id="footer-logo">
			<a href="<?php echo home_url(); ?>/"><img src="<?php echo get_template_directory_uri(); ?>/img/logo-footer.png" border="0" /></a>
		</div>
	</footer>

</div><!-- #page -->

<?php wp_footer(); // This is always called last ?>

</body>
</html>