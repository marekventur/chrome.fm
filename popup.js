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
					
				}
				else
				{
					// we're still loading the user context, be patient
					$('.track-action').hide();
					$('#image').attr('src', 'palceholder.png');
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
						/*<tr class="" id="r9_100643029_917241982" data-track-id="100643029">
 <td class="imageCell imageSmall ">
 <a href="/music/Justice/_/D.A.N.C.E.+%5BRadio+Edit%5D"><img height="34" width="34" alt="" src="http://userserve-ak.last.fm/serve/34s/69030050.png"></a> </td>
 
 <td class="playbuttonCell ">
 <div></div>
 </td>
 <td class="subjectCell ">
 <a href="/music/Justice">Justice</a> – <a href="/music/Justice/_/D.A.N.C.E.+%5BRadio+Edit%5D">D.A.N.C.E. [Radio Edit]</a> </td>
 <td class="lovedCell">
 </td>
 <td class="smallmultibuttonCell ">
 <a href="/music/Justice/_/D.A.N.C.E.+%5BRadio+Edit%5D" class=" 
 mRemoveFromLibrary 
 mSend mAddTags
 mAddToPlaylist
 mLove mBuy
 lfmButton lfmMultiButton lfmButtonFortrack lfmSmallButton lfmSmallMultiButton lfmMultiButtonFull
" forcelink="1"><span></span></a>
<script>LFM.Page.Tracker.storeResourceTypeForURL("/music/Justice/_/D.A.N.C.E.+%5BRadio+Edit%5D", "Track");</script> </td>
 <td class="dateCell ">
 <span class="date">1 minute ago</span>
 </td>
 
 </tr>*/
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
