/*
This is a javascrip lastfm api dependant on jsonp plugion and it is modification of 
http://lastfm.felixbruns.de/javascript-last.fm-api/ - which was using iframes with webform to send get request
*/

function LastFM(options) {
	
	/* Set default values for required options. */
	var apiKey    = options.apiKey    || '';
	var apiSecret = options.apiSecret || '';
	var lastfmUrl    = options.apiUrl    || 'http://ws.audioscrobbler.com/2.0/';
	
	/* Private auth methods. */
	var auth = {
		getApiSignature : function(params){
			var keys   = [];
			var string = '';

			for(var key in params){
				keys.push(key);
			}

			keys.sort();

			for(var index in keys){
				var key = keys[index];

				string += key + params[key];
			}

			string += apiSecret;

			/* Needs lastfm.api.md5.js. */
			return md5(string);
		}
	};
	
	/* Private Signed method call. */
	var signedCall = function(method, params, session, callbacks, type){
		/* Set default values. */
		params  = params || {};

		type  = type || 'GET';

		/* Add parameters. */
		params.method  = method;
		params.api_key = apiKey;
		
		/* Add session key. */
		console.log(session);
		if(session && typeof(session.key) != 'undefined'){
			params.sk = session.key;
		}
		else
		{
			if (session) {
				params.sk = session;
			}
		}

		/* Get API signature. */
		params.api_sig = auth.getApiSignature(params);
		
		// Set lastfm callback format
		params.format = 'json';

		/* Call method. */
		internalCall(params, callbacks, type);
	};
	
	var	internalCall = function(params, callbacks, type) {

		type  = type || 'GET';

		var url,
			jsonResponse,
			callbackFunction;
		if(typeof(callbacks) != 'undefined' && typeof(callbacks.success) != 'undefined'){
			callbackFunction = callbacks.success;
		}
		
		var paramArray = [];

		for(var param in params){
			paramArray.push(param + "=" + params[param]);
		}

		/* Set script source. */
		url = lastfmUrl + '?' + paramArray.join('&');	
		
		
		$.ajax(
			url,
			{
				'dataType': 'json',
				success: function(res) {
					callbackFunction(res);
				},
				erros: function(res) {
					callbackFunction(res);
				},
				'type': type
			}
		);
	};
	
	//lastfm Methods
	this.auth = {
		getSession : function(params, callbacks){
			signedCall('auth.getSession', params, null, callbacks);
		},
		getToken : function(params, callbacks) {
			signedCall('auth.getToken', params, null, callbacks);
		}	
	};	
	
	/* User methods. */
	this.user = {
		getArtistTracks : function(params, callbacks){
			signedCall('user.getArtistTracks', params, callbacks);
		},

		getBannedTracks : function(params, callbacks){
			signedCall('user.getBannedTracks', params, callbacks);
		},

		getEvents : function(params, callbacks){
			signedCall('user.getEvents', params, callbacks);
		},

		getFriends : function(params, callbacks){
			signedCall('user.getFriends', params, callbacks);
		},

		getInfo : function(params, callbacks){
			signedCall('user.getInfo', params, callbacks);
		},

		getLovedTracks : function(params, callbacks){
			signedCall('user.getLovedTracks', params, callbacks);
		},

		getNeighbours : function(params, callbacks){
			signedCall('user.getNeighbours', params, callbacks);
		},

		getNewReleases : function(params, callbacks){
			signedCall('user.getNewReleases', params, callbacks);
		},

		getPastEvents : function(params, callbacks){
			signedCall('user.getPastEvents', params, callbacks);
		},

		getPersonalTracks : function(params, callbacks){
			signedCall('user.getPersonalTracks', params, callbacks);
		},

		getPlaylists : function(params, callbacks){
			signedCall('user.getPlaylists', params, callbacks);
		},

		getRecentStations : function(params, session, callbacks){
			signedCall('user.getRecentStations', params, session, callbacks);
		},

		getRecentTracks : function(params, callbacks){
			signedCall('user.getRecentTracks', params, callbacks);
		},

		getRecommendedArtists : function(params, session, callbacks){
			signedCall('user.getRecommendedArtists', params, session, callbacks);
		},

		getRecommendedEvents : function(params, session, callbacks){
			signedCall('user.getRecommendedEvents', params, session, callbacks);
		},

		getShouts : function(params, callbacks){
			signedCall('user.getShouts', params, callbacks);
		},

		getTopAlbums : function(params, callbacks){
			signedCall('user.getTopAlbums', params, callbacks);
		},

		getTopArtists : function(params, callbacks){
			signedCall('user.getTopArtists', params, callbacks);
		},

		getTopTags : function(params, callbacks){
			signedCall('user.getTopTags', params, callbacks);
		},

		getTopTracks : function(params, callbacks){
			signedCall('user.getTopTracks', params, callbacks);
		},

		getWeeklyAlbumChart : function(params, callbacks){
			signedCall('user.getWeeklyAlbumChart', params, callbacks);
		},

		getWeeklyArtistChart : function(params, callbacks){
			signedCall('user.getWeeklyArtistChart', params, callbacks);
		},

		getWeeklyChartList : function(params, callbacks){
			signedCall('user.getWeeklyChartList', params, callbacks);
		},

		getWeeklyTrackChart : function(params, callbacks){
			signedCall('user.getWeeklyTrackChart', params, callbacks);
		},

		shout : function(params, session, callbacks){
			signedCall('user.shout', params, session, callbacks, 'POST');
		}
	};
	
    this.track = {
    	getInfo : function(params, callbacks){
    		signedCall('track.getInfo', params, null, callbacks);
    	},
    	love : function(params, session, callbacks){
    		signedCall('track.love', params, session, callbacks, 'POST');
    	},
    	unlove : function(params, session, callbacks){
    		signedCall('track.unlove', params, session, callbacks, 'POST');
    	},
    	updateNowPlaying : function(params, session, callbacks){
    		signedCall('track.updateNowPlaying', params, session, callbacks, 'POST');
    	},
    	scrobble : function(params, session, callbacks){
    		signedCall('track.scrobble', params, session, callbacks, 'POST');
    	}
    };

	/* Artist methods. */
	this.artist = {
		addTags : function(params, session, callbacks){
			/* Build comma separated tags string. */
			if(typeof(params.tags) == 'object'){
				params.tags = params.tags.join(',');
			}

			signedCall('artist.addTags', params, session, callbacks, 'POST');
		},

		getCorrection : function(params, callbacks){
			signedCall('artist.getCorrection', params, null, callbacks);
		},

		getEvents : function(params, callbacks){
			signedCall('artist.getEvents', params, null, callbacks);
		},

		getImages : function(params, callbacks){
			signedCall('artist.getImages', params, null, callbacks);
		},

		getInfo : function(params, callbacks){
			signedCall('artist.getInfo', params, null, callbacks);
		},

		getPastEvents : function(params, callbacks){
			signedCall('artist.getPastEvents', params, null, callbacks);
		},

		getPodcast : function(params, callbacks){
			signedCall('artist.getPodcast', params, null, callbacks);
		},

		getShouts : function(params, callbacks){
			signedCall('artist.getShouts', params, null, callbacks);
		},

		getSimilar : function(params, callbacks){
			signedCall('artist.getSimilar', params, null, callbacks);
		},

		getTags : function(params, session, callbacks){
			signedCall('artist.getTags', params, session, callbacks);
		},

		getTopAlbums : function(params, callbacks){
			signedCall('artist.getTopAlbums', params, null, callbacks);
		},

		getTopFans : function(params, callbacks){
			signedCall('artist.getTopFans', params, null, callbacks);
		},

		getTopTags : function(params, callbacks){
			signedCall('artist.getTopTags', params, null, callbacks);
		},

		getTopTracks : function(params, callbacks){
			signedCall('artist.getTopTracks', params, null, callbacks);
		},

		removeTag : function(params, session, callbacks){
			signedCall('artist.removeTag', params, session, callbacks);
		},

		search : function(params, callbacks){
			signedCall('artist.search', params, null, callbacks);
		},

		share : function(params, session, callbacks){
			/* Build comma separated recipients string. */
			if(typeof(params.recipient) == 'object'){
				params.recipient = params.recipient.join(',');
			}

			signedCall('artist.share', params, session, callbacks, 'POST');
		},

		shout : function(params, session, callbacks){
			signedCall('artist.shout', params, session, callbacks, 'POST');
		},

	};
};