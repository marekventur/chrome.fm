
// Open connection to background script
var port =  chrome.extension.connect();
port.onMessage.addListener(function(message) {
	console.log(message);

	var type = message.type;
	var data = message.data;

	if (type == 'track') {
		console.log ('track', data);
		if (data != null) {
			$('#currently-listening').show();
			$('#currently-not-listening').hide();

	        $('.track-name').text(data.track.title);
	        $('.track-artist').text(data.track.artist.name);

	        // show hide/scrobbler info
	        if (data.application) {
	        	$('.scrobbler').text(data.application);
	        	$('.scrobbler-unknown').hide();
	        }
	        else
	        {
	        	$('.scrobbler-known').hide();
	        }
	    }
	    else
	    {
	    	$('#currently-listening').hide();
			$('#currently-not-listening').show();
	    }
    }

    if (type == 'trackContext') {
		console.log ('trackContext', data);
		if (data != null) {
			$('.track-action').show();

			loved = (data.userloved == '1');
			if (loved) {
				$('.track-action-love').hide();
				$('.track-action-unlove').show();
			}
			else
			{
				$('.track-action-love').show();
				$('.track-action-unlove').hide();
			}

			if (data.album) {
				$('#image').attr('src', data.album.image[1]['#text']);
			}
			
		}
		else
		{
			// we're still loading the user context, be patient
			$('.track-action').hide();
			$('#image').attr('src', 'palceholder.png');
		}
		
        
    }

    if (type == 'user') {
		console.log ('user', data);
        $('.username').text(data.name).attr('href', data.url);
    }
});

port.postMessage({type: 'update'});

$('.track-action-love').click(function() {
	port.postMessage({type: 'love'});
});

$('.track-action-unlove').click(function() {
	port.postMessage({type: 'unlove'});
});