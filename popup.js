getUserSettings(function(user) {
	if (user) {
		$('#no_auth').hide();
		$('.username').text(user.name).attr('href', user.url);

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

					var tags = data.toptags.tag;
					
					addTagsToElement($('#top-tags'), tags);
					
				}
				else
				{
					// we're still loading the user context, be patient
					$('.track-action').hide();
					$('#image').attr('src', 'placeholder.png');
				}
				
		        
		    }

		    if (type == 'recentTracks') {
				console.log ('recentTracks', data);
				if (data != null) {
					var list = $('#recent-list');
					list.empty();
					len = data.length;
					len = Math.min(10, len);
					if (len > 3) {
						$('#show-more-recent-tracks').show().click(function() {
							$('.more-recent-tracks').attr('class', '');
							$('#show-more-recent-tracks').css('visibility', 'hidden');
						});
					}
					else
					{
						$('#show-more-recent-tracks').css('visibility', 'hidden');
					}
					for(var i = 0; i < len; ++i) {
						var track = data[i];
						trackURL = '#';
						artistURL = '#';
						var el = '<li>';
						if (i > 2) {
							el = '<li class="more-recent-tracks">';
						}
						image = track.image[0]['#text'];
						if (image ==  '') {
							image = 'placeholder34.png';
						}
						el += '<img src="'+ image +'">'; 
						el += '<div class="text-container">';
						el += '<a href="'+track.url+'">'+track.artist.name+'</a> - '; 
						el += '<a href="'+track.url+'">'+track.name+'</a> '; 
						el += '</div>';
						el += '</li>';
						list.append($(el));
						
					}
					
				}	
		        
		    }

		});

		port.postMessage({type: 'update'});

		$('.track-action-love').click(function() {
			port.postMessage({type: 'love'});
		});

		$('.track-action-unlove').click(function() {
			port.postMessage({type: 'unlove'});
		});

		$('#open-tag').click(function() {
			if ($('#tag').is(':visible')) {
				$('#tag').hide();
				$('#recent').show();
			}
			else
			{
				$('#recent').hide();
				$('#share').hide();
				$('#tag').show();
			}
			
		});

		$('#open-share').click(function() {
			if ($('#share').is(':visible')) {
				$('#share').hide();
				$('#recent').show();
			}
			else
			{
				$('#recent').hide();
				$('#tag').hide();
				$('#share').show();
			}
			
		});

		$('#send-tags').click(function() {
			$('#tag').hide();
			// TODO: Send tags
			$('#tags').val();
			$('#recent').show();
		});
	} 
	else
	{
		$('#authed').hide();
		$('#no_auth').click(function() {
			console.log('here');
			chrome.tabs.create({url: "options.html"});
		});
	}
});
