function getUserSettings(callback) {
    chrome.storage.sync.get('user', function(data) {
        if ('user' in data) {
            user = data.user;
            callback(user);
        }
        else
        {
            callback(null);
        }
    });
}

function setUserSettings(user, callback) {
    console.log('store', user);
    chrome.storage.sync.set({'user': user}, callback);
}

var apiDetails = {
    apiKey    : '96575f05f3a445135f1acb7d021a3461',
    apiSecret : 'e00cb2ac9c30be9ae6816cbed282e640',
   // cache     : cache
};

function getLastFm() {
    if (lastfm == null) {
        lastfm = new LastFM(apiDetails);
    }
    return lastfm;
}

var lastfm = null;

function getRecentTrack(user, callback) {
    console.log(callback);
    var lastfm = getLastFm();
    lastfm.user.getRecentTracks({
        user: user.username
    }, {
        success : function(data) {
            callback(data);
        }
    });
}