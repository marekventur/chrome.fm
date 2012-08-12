var getView = function() {};

var startBackground = function (port) {
	// Try loading user
	var settings = new Settings();
	settings.getUser(function(user) {
		// Set up a realtime Information handler
		var api = getLastFmAPI(user);
		var realtime = new Realtime(user, api);
		var presenter = new Presenter(user, api, realtime);

		getView = presenter.getView;

		console.log('Background: Success');
	},

	// Failure, means user is not connected yet.
	function() {
        console.log('Background: No user found');

        getView = function() {
        	return {
        		noUserFound: true
        	};
        }
	});
};

// Start the background page
$(function() {
	startBackground();
});


