
var currentTrack = null;
var currentTrackUserContext = null;

var user = {
    name: "marekventur",
    url: "http://www.last.fm/user/marekventur"
};

var updatePopupTrackChangeHandler = null;
var updateUserContextHandler = null;

// Realtime
var realtimeQuery = new lfmc_RecentFeed('track')
    .filterByUser(user.name)
    .addExtraField('application')
    .setType('nowplaying')
    .onData(function(data) {
        if (data.length > 0) {
            currentTrack = data[0];
        }
        else
        {
            currentTrack = null;
        }
        console.log('new track', currentTrack, updatePopupTrackChangeHandler);

        requestCurrentTrackUserContext(function() {
            console.log('user context', currentTrackUserContext);

            // send the real data
            if (updateUserContextHandler) {
                updateUserContextHandler();
            }
        });

        // send the null data
        if (updateUserContextHandler) {
            updateUserContextHandler();
        }

        if (updatePopupTrackChangeHandler) {
            updatePopupTrackChangeHandler();
        }
    })
    .onError(function(message) {
        console.log ('error',message)   
    })
    .run();

// API

/* Create a cache object */
// var cache = new LastFMCache();

/* TODO: replace this keys! */
var lastfm = new LastFM({
    apiKey    : 'f21088bf9097b49ad4e7f487abab981e',
    apiSecret : '7ccaec2093e33cded282ec7bc81c6fca',
   // cache     : cache
});

function requestCurrentTrackUserContext(callback) {
    currentTrackUserContext = null;
    if (currentTrack) {
        /* Load some artist info. */
        lastfm.track.getInfo({'artist': currentTrack.track.artist.name, 'track':currentTrack.track.title, 'username': user.name}, null, {
            success: function(data){
                currentTrackUserContext = data.track;
                callback();
            }, 
            error: function(code, message){
                console.log('error', code, message);
            }
        });
    }
}

// Send functions
function sendCurrentTrack(port) {
    postMessage(port, 'track', currentTrack);
}

function sendCurrentTrackUserContext(port) {
    postMessage(port, 'trackContext', currentTrackUserContext);
}

function sendUser(port) {
    postMessage(port, 'user', user);
}

// Helper
function postMessage(port, type, data) {
    port.postMessage({"type": type, "data": data});
}

// Set up communication
chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(message) {
        console.log('got message', message);
        if (message.type == 'update') {
            sendCurrentTrack(port);
            sendUser(port);
            sendCurrentTrackUserContext(port);
        }

        if (message.type == 'love') {
            currentTrackUserContext.userloved = '1';
            // ToDo: Love track via API
            sendCurrentTrackUserContext(port);
        }

        if (message.type == 'unlove') {
            currentTrackUserContext.userloved = '0';
            // ToDo: Unlove track via API
            sendCurrentTrackUserContext(port);
        }
    });

    updatePopupTrackChangeHandler = function() {
        console.log('updatePopupTrackChangeHandler');
        sendCurrentTrack(port);
    }

    updateUserContextHandler = function() {
        console.log('updateUserContextHandler');
        sendCurrentTrackUserContext(port);
    }

    port.onDisconnect.addListener(function() {
        updatePopupTrackChangeHandler = null;
        updateUserContextHandler = null;
    });
});