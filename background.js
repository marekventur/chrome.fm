
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

// YouTube scrobbler

//http://s.youtube.com/s?et=14.982&fvid=RrDHrwLUtvk&vw=640&st=2.941&rendering=software&vh=360&decoding=software&sw=1.0&nsidf=20&iframe=1&hbd=4985297&tsphab=1&vid=IBPCvp8x_1tPnFD253li1f9Y0WIakI2XC&vq=auto&tspne=0&bc=1779621&len=14.982&tspfdt=159&nsivbblmin=6.000&h=377&volume=100&hbt=1.990&ns=yt&docid=4JCrmVBtJ4E&nsivbblmean=391918.183&md=1&fmt=34&el=embedded&rmkt=1&nsiabblmax=120365.000&hasstoryboard=1&nsiabblmin=33.000&fexp=901601,913602,924700,909414,922600,922401,914058,913547,920706,907344,907217,924402,915507,924500,911637,902518,900816,904721,919804,921602,912706&nsivbblc=459&sd=BADC21E22HH1343330556567349&w=670&nsiabblmean=91769.526&framer=http%3A%2F%2Fwww.google.com%2Fchrome%2Fintl%2Fen%2Fmore%2Fspeed.html&tpmt=18&nsiabblc=458&fs=0&cfps=14.911463187325257&screenw=1280&hl=en_US&screenh=1024&playerw=670&eurl=http%3A%2F%2Fwww.google.com%2Fchrome%2Fintl%2Fen%2Fmore%2Fspeed.html&playerh=405&scoville=1&pd=0.600&mos=0&ptk=google&nsivbblmax=681826.000&rt=83.958&plid=AATFwISfVLOfeeQ2

var filter = {
    urls: ['http://s.youtube.com/s*']
  };
var notification;

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    url = parseURL(details.url);
    console.log(url);
    console.log('len', url.params.len);
    console.log('pos', url.params.et);
    console.log('id', url.params.docid);

    getTitle(url.params.docid, function(t){
        notification = webkitNotifications.createNotification(
          'icon.png',  // icon url - can be relative
          t,  // notification title
          url.params.et + ' of ' + url.params.len  // notification body text
        );
        notification.show();
    });

}, filter);

// This function creates a new anchor element and uses location
// properties (inherent) to get the desired URL data. Some String
// operations are used (to normalize results across browsers).
 
function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
}




function getTitle(id, callback) {


    $.get('https://gdata.youtube.com/feeds/api/videos/'+id+'?v=2&alt=json', function(data) {
        console.log(data);
        media = data.entry['media$group']['media$category'];
        found = false;
        len = media.length;
        for (i=0;i<len;i++) {
            if (media[i].label == 'Music') {
                found = true;
            }
        }
        if (found) {
            title = data.entry.title['$t'];
            console.log(title);
            callback(title);
        }
    })
}