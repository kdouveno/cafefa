function ajax(e, fx){
	e.preventDefault();
	const form = e.target;
	fetch(form.action, { method: form.method, body: new FormData(form) })
	  .then(response => response.json())
	  .then(json => fx(json));
	return false;
}