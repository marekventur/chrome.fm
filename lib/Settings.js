var Settings = function () {
	
	var that = this;

	that.get = function (key, callback, defaultValue) {
		chrome.storage.local.get(key, function(data) {
			if (key in data) {
	            callback(data[key]);
	        }
	        else
	        {
	            callback(defaultValue);
	        }
	        console.log(data);
		});
	}

	that.set = function(key, value, callback) {
		callback = callback || function() {};
		chrome.storage.local.set({key: value}, callback);
	}

	that.getUser = function(success, failure) {
		failure = failure || function() {};
		that.get('user', function(user) {
			if (user) {
	            callback(user);
	        }
	        else
	        {
	            failure();
	        }
		});
	}

	that.setUser = function(user) {
		failure = failure || function() {};
		that.set('user', user);
	}

	that.shouldScrobble = function(service, callback) {
		// Scrobble Everything!
		callback(true);
	}


}