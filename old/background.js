getUserSettings(function(user) {
    if (user) {
        var currentTrack = null;
        var currentTrackUserContext = null;
        var recentTracks = null;

        var updatePopupTrackChangeHandler = null;
        var updateUserContextHandler = null;

        function updateRecentTracks() {
            // update recent tracks
            getRecentTrack(user, function(data) {
                recentTracks = data;
            });
        }

        // Realtime
        function realtimeTrackFound(data) {
            if (data.length > 0) {
                currentTrack = data[0];
            }
            else
            {
                currentTrack = null;
            }
            console.log('new track', currentTrack, updatePopupTrackChangeHandler);

            requestCurrentTrackUserContext(function() {
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

            updateRecentTracks();
        }

        updateRecentTracks();

        var realtimeQuery = new lfmc_RecentFeed('track')
            .filterByUser(user.name)
            .addExtraField('application')
            .setType('nowplaying')
            .onData(realtimeTrackFound)
            .onError(function(message) {
                console.log ('error',message)   
            })
            .run();

        // No-HackdayNode-Workaround:
        /*realtimeTrackFound([{
            track: {
                title: 'Intro',
                artist: {
                    name: 'The XX'
                }
            },
            application: 'Fake Scrobbler'
        }]);*/
        // API

        function requestCurrentTrackUserContext(callback) {
            currentTrackUserContext = null;
            if (currentTrack) {
                /* Load some artist info. */
                getLastFm().track.getInfo({'artist': currentTrack.track.artist.name, 'track':currentTrack.track.title, 'username': user.name}, {
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

        function sendRecentTracks(port) {
            postMessage(port, 'recentTracks', recentTracks);
        }

        function sendCurrentTrackUserContext(port) {
            postMessage(port, 'trackContext', currentTrackUserContext);
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
                    sendCurrentTrackUserContext(port);
                    sendRecentTracks(port);                    
                }

                if (message.type == 'love') {
                   
                    getLastFm().track.love({
                        artist: currentTrack.track.artist.name,
                        track: currentTrack.track.title
                    }, user.sessionKey, {
                        success: function(data) {
                            if ( ! data.error) {
                                console.log('loved', data);
                            }
                            else
                            {
                                console.log('error', data);
                            }
                        }
                    });

                    currentTrackUserContext.userloved = '1';
                    sendCurrentTrackUserContext(port);

                    // update recent tracks
                    getRecentTrack(user, function(data) {
                        recentTracks = data;
                    });
                }

                if (message.type == 'unlove') {

                    getLastFm().track.unlove({
                        artist: currentTrack.track.artist.name,
                        track: currentTrack.track.title
                    }, user.sessionKey, {
                        success: function(data) {
                            if ( ! data.error) {
                                console.log('unloved', data);
                            }
                            else
                            {
                                console.log('error', data);
                            }
                        }
                    });

                    currentTrackUserContext.userloved = '0';
                    sendCurrentTrackUserContext(port);

                    // update recent tracks
                    getRecentTrack(user, function(data) {
                        recentTracks = data;
                    });
                }
            });

            updatePopupTrackChangeHandler = function() {
                sendCurrentTrack(port);
            }

            updateUserContextHandler = function() {
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
            urls: ['*://s.youtube.com/s*']
        };

        chrome.webRequest.onBeforeRequest.addListener(function(details) {
            //console.log(details);
            url = parseURL(details.url);
            handleYouTubeEvent(url.params.len, url.params.et, url.params.docid);
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

        /*
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
        */

        var lastTrackIdNowPlaying = null;
        var lastTrackIdScrobble = null;

        function handleYouTubeEvent(len, pos, id) {
            getTrack(id, function(track) {
                
                // Follow da rulez
                if (len > 30) {         
                    if ((pos < 2) && (lastTrackIdNowPlaying != id)) {
                        lastTrackIdScrobble = null;
                        lastTrackIdNowPlaying = id;
                        sendNowPlaying(track);

                        var notification = webkitNotifications.createNotification(
                          'icon48.png',  
                          'Now playing on YouTube',  
                          track.title + " by " + track.artist  
                        );
                        notification.show();
                    }

                    var scrobblePoint = Math.min(4 * 60, len / 2);
                
                    if ((pos >= scrobblePoint) && (lastTrackIdScrobble != id)) {
                        lastTrackIdScrobble = id;
                        lastTrackIdNowPlaying = null;
                        sendScrobble(track);

                        var notification = webkitNotifications.createNotification(
                          'icon48.png',  
                          'Scrobbled',  
                          track.title + " by " + track.artist  
                        );
                        notification.show();
                    }
                }
            },
            function() {
               
                
            });
        }

        function sendNowPlaying(track) {
            console.log('nowPlaying', track);
            getLastFm().track.updateNowPlaying({
                artist: track.artist,
                track: track.title,
                duration: track.duration
            }, user.sessionKey, {
                success: function(data) {
                    if ( ! data.error) {
                        console.log('nowPlaying sent', data);
                    }
                    else
                    {
                        console.log('error', data);
                    }
                }
            });
        }

        function sendScrobble(track) {
            console.log('scrobble', track);
            getLastFm().track.scrobble({
                'artist[0]': track.artist,
                'track[0]': track.title,
                'timestamp[0]':  Math.round((new Date()).getTime() / 1000)
            }, user.sessionKey, {
                success: function(data) {
                    if ( ! data.error) {
                        console.log('scrobble sent', data);
                    }
                    else
                    {
                        console.log('error', data);
                    }
                }
            });
        }

        var idToTitle = {};
        function getTrack(id, callback, error) {
            if (id in idToTitle) {
                if (idToTitle[id] == 'nope') {
                    error()
                }
                else
                {
                    callback(idToTitle[id]);
                }
                return;
            }

            $.ajax({
                url: 'http://playground.last.fm/demo/dev/scrobbler/match?gvid='+id,
                statusCode: {
                    200: function(data) {
                        idToTitle[id] = data;
                        callback(data);
                    },
                    503: function() {
                        idToTitle[id] = 'nope';
                        error();
                        console.log('nope, it\'s probably not music');

                        var notification = webkitNotifications.createNotification(
                          'icon48.png',  
                          'Not a track?',  
                          'Please give feedback if this is a mistake. Id: '+id  
                        );
                        notification.show();
                    }
                }
            });
        }
    }
    else
    {
        console.log('no user found');
        chrome.extension.onConnect.addListener(function(port) {
            // quick hack!
            location.reload();
        });
    }
});