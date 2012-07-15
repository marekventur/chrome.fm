function getUsername() {
	return localStorage["username"];
}

function setUsername(username) {
	localStorage["username"] = username;
}


// Options
function save_options() {
  setUsername($('#username').val());
}

function restore_options() {
  $('#username').val(getUsername());
}