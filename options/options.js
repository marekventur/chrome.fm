$(function() {
    var settings = new Settings();
    settings.getUser(function(user) {
        // A user is already connected
        $('#not_authorized').hide();
        $('#username').html(user.name);
    },function() {

        // No user found :( 
        $('#authorized').hide();

        // Set the click handler
        $('#auth_app').click(function() {
            $('#wait').show();
            $('#not_authorized').hide();

            //  This is the only time where we need the API without a user context
            var api = getLastFmAPI();

            api.auth.getToken({}, {
                success: function(data) {
                    var token = data.token;
                    var url ="http://www.last.fm/api/auth/?api_key="+apiDetails.apiKey+"&token="+token;
                    
                    window.open(url, 'Auth');

                    var checkToken = function() {
                        getLastFm().auth.getSession({"token": token}, {
                            success: function(data) {
                                if ( ! data.error) {
                                    
                                    var user = {
                                        name: data.session.name,
                                        sessionKey: data.session.key,
                                        url: 'http://www.last.fm/user/'+data.session.name
                                    };

                                    settings.setUser(user);


                                    $('#wait').hide();
                                    $('#authorized').show();
                                    $('#username').html(user.name);

                                    // Cause the background page to reload
                                    chrome.extension.getBackgroundPage().startBackground();

                                    alert('Authorization successfull!');
                                } 
                                else
                                {
                                    setTimeout(checkToken, 500);
                                }

                            }
                        });
                    };
                    setTimeout(checkToken, 1000);
                }
            })
        });
    });

    // We might need this in both cases:
    $('#un_auth').click(function() {
        setUserSettings(null);
        $('#not_authorized').show();
        $('#authorized').hide();                           
    });

    getUserSettings(function(user) {
        if (user) {
            
        } 
        else
        {
            
        }

        
    });


    

	
});
