login = function(){
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;

	var data = {
		email: email,
		password: password
	}

	fetch('/api/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}).then(function(response){
		if(response.status === 200){
			window.location.href = '/home';
		} else {
			response.json().then(function(data){
				alert(data.message);
			});
		}
	});
}