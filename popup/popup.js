$(function() {
	// Open connection to background script

	var view = chrome.extension.getBackgroundPage().getView();
	var template = $("#mustache-main").html();
	console.log(template);
	var output = Mustache.to_html(template, view);
	$('#main').html(output);
	
});