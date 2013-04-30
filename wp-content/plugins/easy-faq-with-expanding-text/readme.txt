=== Easy FAQ with Expanding Text ===
Contributors: bgentry
Donate link: http://bryangentry.us/pay-me
Tags: faq pages
Tested up to: 3.5
Stable tag: 3.1.5
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Easily create a Frequently Asked Questions page with answers that slide down when the questions are clicked. No need for a shortcode.

== Description ==

Lots of pages online have a dropdown text feature, where clicking a heading reveals next or photos underneath it. This plugin provides the easiest way to create these effects in your WordPress pages and posts. Anyone who can use the WordPress GUI editor can use this plugin to create the FAQ pages. No need for a shortcode or other coding needed!

To create your FAQ page, just click a checkbox on the post editing screen, or include "Frequently Asked Questions" or "FAQ" somwhere in the title. In the content of the page, select a heading style for the questions or titles that you want to appear, and the paragraphs, lists, photos, and videos beneath them will be hidden until the heading is clicked.

== Installation ==

1. Upload the 'easy-faq-by-bgentry' folder `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Click on FAQ Admin Page in the left-side menu on the dashboard for detailed instructions

== Changelog ==

= 3.1.5 =
Improved compability with Internet Explorer by removing a line of javascript that was not needed.

= 3.1 =
* Very minor update to adjust the location of the arrows and other images that indicate that a heading has drop down text. Now those will be centered even in themes that assign padding to the top of those headings.

= 3.0 =
* Now you can assign the expanding text effect to any page or post, including pages that do not have "FAQ" in the title. This is done through a checkbox added to each page and post editing screen. Pages containing "FAQ" or "Frequently asked questions" in the title still receive the effect automatically, so people who used previous versions of this plugin do not need to go back and change anything.
* The drop down text effects work on pages, single posts, and in a list of posts (index page)
* Added two options for a visual cue that makes it obvious that you can click on the questions to expand some text.
* Formatting a line of text as a heading 6 (h6) now allows users to stop the dropdown animations for that line and the lines following it, until another heading is used again.

= 2.1 =
* Made the plugin more compatible with other plugins or themes that add elements to a page's content (such as social share buttons). With this update, those themes should not make the introductory paragraphs disappear.

= 2.0 =
* Improved the performance of the plugin when answers contain different colored text, lists, etc.
* Removed the need to examine your WordPress theme and HTML to determine the class name for your content container. The plugin now finds the content automatically.
* Updated and perfected the documentation and instructions.

= 1.1 =
*Added styles so a hand pointer cursor shows when people hover over headings / questions
*Allowed unordered and ordered lists to be used in answers and hidden / shown correctly
*Allow one to two paragraphs (depending on theme) at the very beginning of the content that is not hidden, allowing user to use an introductory paragraph

= 1.0 =
* The plugin was invented!