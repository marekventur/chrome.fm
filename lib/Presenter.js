var Presenter = function(user, api, realtime) {
	function getView() {
		return {
			'user': user,
			'api': api,
			'realtime': realtime
		};
	}
}