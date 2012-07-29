$(function() {
    getUserSettings(function(user) {
        if (user) {
            $('#not_authorized').hide();
            $('#username').html(user.name);
        } 
        else
        {
            $('#authorized').hide();

            $('#auth_app').click(function() {
                $('#wait').show();
                $('#not_authorized').hide();
                getLastFm().auth.getToken({}, {
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

                                        setUserSettings(user);

                                        console.log(data);

                                        $('#wait').hide();
                                        $('#authorized').show();
                                        $('#username').html(user.name);

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
        }

        $('#un_auth').click(function() {
            setUserSettings(null);
            $('#not_authorized').show();
            $('#authorized').hide();                           
        });
    });


    

	
});
