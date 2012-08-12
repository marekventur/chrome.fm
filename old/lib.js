function getUserSettings(callback) {
    chrome.storage.local.get('user', function(data) {
        
    });
}

function setUserSettings(user, callback) {
    console.log('store', user);
    chrome.storage.local.set({'user': user}, callback);
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
    var lastfm = getLastFm();
    lastfm.user.getRecentTracksSigned({
        user: user.name,
        extended: "true"
    }, user.sessioKey, {
        success : function(data) {
            callback(data.recenttracks.track);
        }
    });
}

function addTagsToElement($el, tags) {
    console.log(tags);
    var len = tags.length;

    if (len == 0) {
        $el.hide();
    }
    else
    {
        var list = $el.find('.tags-list');
        list.empty();
        var content = '';
        for (var i=0;i<len;++i) {
            if (i) {
                content += ' :: ';
            }
            content += '<a href="#">'+tags[i].name+'</a>';
        }
        console.log(len);
        var $content = $(content);
        console.log($content);
        $content.click(function(e) {
            var tag = $(e.target).text();
            if ($('#tags').val() != "") {
                $('#tags').val($('#tags').val()+",");
            } 
            $('#tags').val($('#tags').val()+tag);
        });

        list.empty().append($content);
    }
 
    
}
