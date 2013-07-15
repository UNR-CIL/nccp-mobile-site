/**
 * Super Simple Fancy Checkbox Plugin 
 * @Dave Macaulay, 2013
 */
(function( $ ) {
	$.fn.simpleCheckbox = function(options) {
 
		var defaults = {
			newElementClass: 'simple-checkbox-replace',
			activeElementClass: 'active'
		}
 
		var options = $.extend(defaults, options);
 
		this.each(function() {
 
			//Assign the current checkbox to obj
			var obj = $(this);
 
			//Create new span element to be styled
			var newObj = $('<a/>', {
			    'id': '#' + obj.attr('id'),
			    'class': options.newElementClass,
			    'style': 'display: block;'
			}).appendTo(obj.parent());
 
			//Make sure pre-checked boxes are rendered as checked
			if(obj.is(':checked')) {
				newObj.addClass(options.activeElementClass);
			}
 
			obj.hide(); //Hide original checkbox
 
			//Labels can be painful, let's fix that
			if($('[for=' + obj.attr('id') + ']').length) {
 
				var label = $('[for=' + obj.attr('id') + ']');
				label.click(function() {
					newObj.trigger('click'); //Force the label to fire our element
					return false;
				});
 
			}

			// Save a reference to the actual input element for binding in click handlers
			var input = obj;

			// Label element click handler
			obj.parent('label').click( function () {

				Click( newObj, input );
				return false;

			});			
 
			// Span element click handler
			newObj.click(function() {

				Click( this, input );
				return false;
 
			});

			function Click ( newObj, input ) {
				$(newObj).toggleClass( options.activeElementClass );
				if ( $(newObj).hasClass( options.activeElementClass ) ) {
					$(input).attr( 'checked', true );
				} else {
					$(input).attr( 'checked', false );
				}
			}
 
		});
 
	};
})(jQuery);