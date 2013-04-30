$(document).bind( "mobileinit", function () {
	$.mobile.ajaxEnabled = false;
	$.event.special.swipe.horizontalDistanceThreshold = 200;
});
