function bgfaq(foldup) {
		jQuery('.bg_faq_content_section :header:not(h6)').each(function(){ // select all the heading in .bg_faq_content_section other than h6
			jQuery(this).addClass('bg_faq_closed'); 					//make these heading "closed"
			jQuery(this).nextUntil(':header').css({'display':'none'}); 	//hide everything up until the next heading
			var textsize = jQuery(this).css('font-size'); 				//get the font size in order to more accurately position the visual cue
			var halftextsize = parseInt(textsize)/2;
			var backgroundpos = Math.round(halftextsize)-10;
			var padding = jQuery(this).css('padding-top'); 				//get the padding in order to help us position the visual cue
			var padding = parseInt(padding);
			var backgroundpos = Math.round(halftextsize)-10+padding;
			jQuery(this).css({'background-position-y': backgroundpos}); //position the visual cue
			
		jQuery(this).click(function(){
																		//whenever one of these headings is clicked,
			if(jQuery(this).hasClass('bg_faq_opened')) {				//check to see if it's opened. If so,...
				jQuery(this).nextUntil(':header').slideUp();			//slide up the content beneath it and mark this heading "closed"
				jQuery(this).removeClass('bg_faq_opened').addClass('bg_faq_closed');
				}														
		else {															//if it isn't opened,
		if(foldup=='yes') {												//check to see we are supposed to fold up other content so only one answer shows at a time.
			jQuery('.bg_faq_opened').each(function(){					//if so...
				jQuery(this).nextUntil(':header').slideUp();			//foldup other content and mark the headings as closed
				jQuery(this).removeClass('bg_faq_opened').addClass('bg_faq_closed');
			})
		}
		jQuery(this).nextUntil(':header').slideDown();					//then roll out the content and mark the heading as opened
		jQuery(this).removeClass('bg_faq_closed').addClass('bg_faq_opened');
		}
		
		
		})			
			
		});
		

	}