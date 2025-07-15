class Ajax {
	constructor() {
		return this.ajax.bind(this);
	}
	/**
	 * Handles AJAX form submissions or manual form data processing.
	 *
	 * @param {Event|HTMLFormElement} e - The event object, typically from a form submission.
	 * @param {Function|string|[Function|string]} fx - The callback function to handle the response, or a string referencing a method.
	 * @param {Object} [options] - Optional configuration for manual form handling.
	 * @param {string} options.action - The URL to which the form data will be submitted. (Required if not using a form element)
	 * @param {string} options.method - The HTTP method to use for the request (e.g., "POST", "GET"). (Required if not using a form element)
	 * @param {Object} options.form - The form data object to be manually processed. (Required if not using a form element)
	 * @param {...*} parameters - Additional parameters to pass to the callback function.
	 *
	 * @throws {Error} If the callback function is invalid.
	 * @throws {Error} If the form action is not defined.
	 * @throws {Error} If the form method is not defined.
	 * @throws {Error} If the form is not defined in manual mode.
	 *
	 * @returns {boolean} Returns false to prevent default form submission behavior, or undefined if an error occurs.
	 */
	async ajax(e, fx, options, ...parameters){ // TODO: make params an object
		let formData;
		let action;
		let method;

		if (e instanceof Event) {
			if(e.target.tagName !== 'FORM'){
				if(!options) throw new Error("Options are not defined though target isn't a form.");
					
			} else {
				e.preventDefault();
				e = e.target;
			}
		}
		if (options) {
				if(!options.action)
					throw new Error("Form action is not defined.");
				if(!options.method)
					throw new Error("Form method is not defined.");
				if(!options.form)
					console.warn("Form is not defined.");
				action = options.action;
				method = options.method;
				if(!options.method.match(/GET|HEAD/))
					formData = this.manualForm(options.form);
		}
		if (e instanceof HTMLFormElement) {
			if (!e.action)
				throw new Error("Form action is not defined.");
			if (!e.method)
				throw new Error("Form method is not defined.");
			action = e.action;
			method = e.method;
			formData = new FormData(e);
		}
		if (!(fx instanceof Array))
			fx = [fx];
		fx = fx.map(f => {
			if (typeof f === "string")
				f = this["$" + f];
			if (typeof f !== "function"){
				throw new Error("Invalid callback function. Must be a function or a string referencing a method.");
			}
			return f;
		});
		let res = await fetch(action, { method: method, body: formData});
		if (res.error)
			throw new Error(res.error);
		for(let f of fx){
			res = await f(res, ...parameters);
		}

		return false;
	}

	manualForm(form){
		let formData = new FormData();
		for(let o in form)
			formData.append(o, form[o]);
		return formData;
	}
	async $inject(res, target){
		let html = await res.text()
		target.innerHTML = html;
		return res;
	}
    async $replace(res, target){
		let html = await res.text()
		target.insertAdjacentHTML("afterend", html);
		target.remove();
		return res;
	}
}
ajax = null;
// Initialize the Ajax class when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
	ajax = new Ajax();
});