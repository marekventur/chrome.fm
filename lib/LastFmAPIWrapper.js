function getLastFmAPI(user) {
	var apiDetails = {
	    apiKey    : '96575f05f3a445135f1acb7d021a3461',
	    apiSecret : 'e00cb2ac9c30be9ae6816cbed282e640',
	   // cache     : cache
	};

	return new LastFM(apiDetails);
}