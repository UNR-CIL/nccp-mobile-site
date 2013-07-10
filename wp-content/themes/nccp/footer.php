<?php
// Page footer.  This doesn't have to be the footer for all pages - it just usually is.
?>

	<footer class="fluid">
		<div id="footer-content" class="row-fluid">
			<span class="span6"></span>
			<span class="copyright span6"><span>&copy;</span> <?php echo date( 'Y' ); ?></span>			
		</div>

		<img id="footer-bg" src="<?php echo get_template_directory_uri(); ?>/assets/img/sprites/footer-bg.png" border="0" />		

		<div id="footer-base" class="fluid">
			<img src="<?php echo get_template_directory_uri(); ?>/assets/img/sprites/footer-base.png" border="0" />
		</div>		
	</footer>

</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>