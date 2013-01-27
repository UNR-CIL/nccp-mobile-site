/*
 * @desc Simple overlay for displaying image comp over actual cutup for comparison
 * @requires jquery-ui-draggable
 * @version 0.2
 */

(function ( $ ) {

	// First thing - figure out where the hell we are
	// Since this needs to be as simple as possible and there's no completely
	// reliable way to know where this file is located, just pull the path from
	// the script include itself (which has to be correct or nothing works)
	basepath = $('script.overlay').attr( 'src' ).replace( 'overlay.js', '' );

	// Append the stylesheet before extending
	$('head').append( '<link rel="stylesheet" href="' + basepath + 'style.css" type="text/css" />' );

	// Functions

	var methods = {

		init : function () {

			// Append main overlay element and menu
			this.append( '<div id="overlay"><div id="overlay-menu"><div id="overlay-menu-bg"></div></div></div>' );
			
			// Image element
			$('#overlay').append( '<div id="overlay-image"><img src="" border="0" /></div>' );

			// Image resize element
			$('#overlay-image').prepend( '<div id="overlay-resize-frame"></div>' );
			$('#overlay-resize-frame').append( '<div id="overlay-resize-corner" title="Resize image dimensions"></div>' );
			
			// Set up menu
			$('#overlay-menu').append( '<input id="overlay-toggle" type="button" value="" class="active" title="Toggle on/off" />' );		
			$('#overlay-menu').append( '<div id="overlay-opacity-slider"><div id="overlay-slider" title="Image opacity"></div></div>' );
			$('#overlay-menu').append( '<input id="overlay-new-image" type="button" value="" title="Add new image/image controls" />' );
			$('#overlay-menu').append( '<input id="overlay-close" type="button" value="" title="Remove overlay" />' );
			
			// New image form elements
	        $('#overlay-menu').append( '<form id="overlay-new-image-form" name="overlay-new-image-form" action="' + basepath + 'helper.php" target="overlay-upload-frame" enctype="multipart/form-data" method="post"><input type="file" id="overlay-new-image-file" name="overlay-new-image-file" /><input type="button" id="overlay-resize" name="overlay-resize" title="Resize/move overlay" /><div class="overlay-vr"></div><input type="submit" value="" id="overlay-submit-new-image" name="overlay-submit-new-image" title="Upload new overlay image" /><input type="hidden" id="overlay-page-path" name="overlay-page-path" value="' + window.location.href + '" /></form>' );
	        $('#overlay-menu').append( '<iframe id="overlay-upload-frame" name="overlay-upload-frame" src="' + basepath + 'helper.php" style="width: 0px; height: 0px; border: none;" onload="jQuery.fn.overlay(\'checkFrame\');"></iframe>' );
	       	
			// See if an image exists for the current path

			$.post( basepath + 'helper.php', { 
				retrieve: true, 
				path: window.location.href // This is the key that determines if an overlay exists for this page or not
			}, function ( response ) { 
				var parsed = $.parseJSON( response );

				if ( parsed )
				    // If image exists, display the image and the image controls
					if ( parsed.file ) {
					    $('#overlay-image img').attr( 'src', basepath + 'overlays/' + parsed.file );
					    $('#overlay-toggle, #overlay-opacity-slider').css( 'display', 'inline-block' );
					    
					    // Set sizing info if it exists
					    if ( parsed.sizing ) {
					        console.log( parsed.sizing.top );
					        $('#overlay-image').css({ top: parseInt( parsed.sizing.top ), left: parseInt( parsed.sizing.left ) }).find( 'img' ).width( parseInt( parsed.sizing.width ) );
                         }
					    
					    // Display resize controls
					    $('#overlay-resize, .overlay-vr').css( 'display', 'block' );
					}

			});

			// Set up element events ///////////////////////////////////////////////////////////

			// Draggables		
			$('#overlay-slider').draggable({
				axis: 'x',
				containment: 'parent',
				drag: function ( e, ui ) {
				    // Make sure the overlay is actually displayed
				    if ( ! $('#overlay-image:visible').length )
				        $('#overlay-image').css( 'display', 'block' );
				    
					$('#overlay-image').css( 'opacity', ui.position.left / ( $('#overlay-opacity-slider').width() - $('#overlay-slider').width() ) )
				}
			});
			
			// Overlay draggable - used for image adustment
			$('#overlay-image').draggable();
			$('#overlay-image').draggable( 'disable' ); // Disabled by default
			
			// Resize draggable		
			$('#overlay-resize-corner').draggable({
			    containment: 'window',
			    drag: function ( e, ui ) {
			        // Set the width and height of the resize frame while dragging
			        $('#overlay-resize-frame').width( ( ( $('#overlay-resize-corner').offset().left + $('#overlay-resize-corner').width() ) - $('#overlay-resize-frame').offset().left ) );
			        
			        // Then adjust the size of the actual image while maintaining aspect ratio
			        
			        // Adjust the width
			        if ( Math.abs( ui.position.left - ui.originalPosition.left ) > 0 )
	                	$('#overlay-image img').width( ( 2 * ( $('#overlay-resize-frame').offset().left - $('#overlay-image').offset().left ) ) + $('#overlay-resize-frame').width() );
	                	
			    },
			    stop: function () {
			        $('#overlay-resize-corner').css({ top: 2, right: 2 });  
			    }    
			});		
			
			// Binds ///////////////////////////////////////////////////////////////////////////
			
			$('#overlay-resize').click( function () {
			    // Turn off adustment mode
			    if ( $('#overlay-resize-frame:visible').length ) {
			        $('#overlay-resize-frame').fadeTo( 700, 0, function () { $(this).css( 'display', 'none' ) } );
			        $('#overlay-image').draggable( 'disable' ).removeClass('overlay-draggable');
			        $(this).removeClass( 'lock' );
			        
			        // Save the results
			        $.post( basepath + 'helper.php', { 
	        			edit: true, 
	        			path: window.location.href,
	        			width: $('#overlay-image img').width(),
	        			top: parseInt( $('#overlay-image').css( 'top' ) ),
	        			left: parseInt( $('#overlay-image').css( 'left' ) )
	        		}, function ( response ) { 
	        			var parsed = $.parseJSON( response );
	        
	        			if ( parsed )
	        			    console.log( parsed );
	        		});
			        
			    // Turn on adustment mode
			    } else {
	    		    $('#overlay-image').fadeTo( 400, 0.5 ).draggable( 'enable' ).addClass('overlay-draggable');
	    		    $('#overlay-resize-frame').fadeTo( 700, 0.6 ); 
	    		    $(this).addClass( 'lock' );  
			    }		      
			});
		
			$('#overlay-toggle').click( function () {
				$('#overlay-image').fadeToggle( 400 );
				$(this).toggleClass('active');
			});	
			
			$('#overlay-close').click( function () {
				$('#overlay').remove();	
			});
			
			$('#overlay-new-image').click( function () {
			    if ( $('#overlay-new-image-form:visible').length )
			        $('#overlay-new-image-form').slideUp( 200 );
			    else
			        $('#overlay-new-image-form').slideDown( 200 );  
			});

			// Job's done, back to the studio //////////////////////////////////////////////////
			
			return this;

		},

		checkFrame : function () {

			var parsed = jQuery.parseJSON( jQuery('#overlay-upload-frame').contents().find('body').html() );
		    if ( parsed )
		    	if ( parsed.success ) { // If that worked out, set the new image as the overlay and enable controls
		    		jQuery('#overlay-image img').attr( 'src', basepath + 'overlays/' + parsed.filename );
		    		jQuery('#overlay-toggle, #overlay-opacity-slider').css( 'display', 'inline-block' );
		    		
		    		// Display resize controls
			        $('#overlay-resize, .overlay-vr').css( 'display', 'block' );

			        // Display the image
			        $('#overlay-image').fadeTo( 400, 0.5 );
		    	}			    

		}

	}; 

	$.fn.overlay = function ( method ) {
	    
		// Method calling logic
	    if ( methods[method] ) {
	      	return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      	return methods.init.apply( this, arguments );
	    } else {
	      	$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
	    }
		
	};

})( jQuery );

// EOF ///////////////////////////////////////////////////////////////////////////////
