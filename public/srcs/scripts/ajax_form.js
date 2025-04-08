class Ajax {
	constructor() {
		return this.ajax.bind(this);
	}
	/**
	 * Handles AJAX form submissions or manual form data processing.
	 *
	 * @param {Event} e - The event object, typically from a form submission.
	 * @param {Function|string} fx - The callback function to handle the response, or a string referencing a method.
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
	ajax(e, fx, options, ...parameters){
		let formData;
		let action;
		let method;
		try {
			if (typeof fx === "string"){
				fx = this["$" + fx] ?? fx;
			} else if (typeof fx !== "function"){
				throw new Error("Invalid callback function.");
			}
			
			if(e.target.tagName !== 'FORM' && options){
				if(!options.action)
					throw new Error("Form action is not defined.");
				if(!options.method)
					throw new Error("Form method is not defined.");
				if(!options.form)
					throw new Error("Form is not defined.");
				action = options.action;
				method = options.method;
				formData = this.manualForm(options.form);
			} else {
				e.preventDefault();
				if (!e.target.action)
					throw new Error("Form action is not defined.");
				if (!e.target.method)
					throw new Error("Form method is not defined.");
				action = e.target.action;
				method = e.target.method;
				formData = new FormData(e.target);
			}
			const form = e.target;
			fetch(action, { method: method, body: formData})
			.then(res => fx(res, ...parameters));
		}catch(error) {
			console.error("Error creating form:", error.message);
		};
		return false;
	}
	manualForm(form){
		let formData = new FormData();
		for(let o in Object.entries(form))
			formData.append(o, form[o]);
		return formData;
	}
	$inject(res, target){
		if (res.error){
			target.innerHTML = `<div class="alert alert-danger">${res.error}</div>`;
			throw new Error(res.error);
		}
		res.text().then(html => {
			target.innerHTML = html;
		});
	}
}
ajax = null;
// Initialize the Ajax class when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
	ajax = new Ajax();
});