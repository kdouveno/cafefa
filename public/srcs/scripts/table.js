tables = {};
function debounceCall(callback, delay, ...rest) {
	let timeout;
	return function(event) {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(event, ...rest), delay);
	};
}
// function debounceCall(callback, delay, ...rest) {
// 	let lastTime = null;
// 	return function(event) {
// 		const currentTime = Date.now();
// 		if (lastTime && currentTime - lastTime >= delay)
// 			callback(event, ...rest);
// 		lastTime = currentTime;
// 	};
// }
class Table {
	constructor(tableName){
		this.tableName = tableName;
		this.div = document.getElementById(`db_${tableName}`);
		this.table = this.div.querySelector(`.db_table`);
		let mut = new MutationObserver((mutations) => {
			mutations.forEach(m=>{	
				m.addedNodes.forEach(node => {
					if (node.nodeType !== Node.ELEMENT_NODE || !node.matches(".db_row")) return;
					
					this.InitRowEvents(node);
				});
			});
		});
		mut.observe(this.table.querySelector(".db_body"), { childList: true, subtree: true });
		this.searchForm = document.getElementById(`db_${tableName}_search`);
		if (!(this.searchForm)) {
			throw new Error(`Forms not found for table ${tableName}`);
		}
		tables[this.tableName] = this;
		this.initSubmits();

	}
	initSubmits(){
		this.div.querySelector(".db_insert_submit").addEventListener("click", () => {this.insert()});
		this.searchForm.addEventListener("submit", (event) => this.search(event));
		window.addEventListener("pointerdown", (event) => {
			console.log(event.target, !!event.target.closest(".db_ref_container"));
			
			if (event.target.closest(".db_ref_container")) return; // If the click is inside a ref container, do nothing
			this.hideRefsOptions();
		});
		this.div.querySelectorAll(".db_row").forEach(row => {
			this.InitRowEvents(row);
		});
	}
	InitRowEvents(row){
		row.querySelectorAll(`.db_input.db_update`).forEach(input => {
			input.addEventListener("click", (event) => {
				event.preventDefault();
				this.update(row);
				return false;
			});
		});
		row.querySelectorAll(`.db_input.db_delete`).forEach(input => {
			input.addEventListener("click", (event) => {
				this.delete(row);
			});
		});

		row.querySelectorAll(`.db_ref_container`).forEach(cont => {
			cont.querySelector(".db_ref_search").addEventListener("input", debounceCall((event) => {
				this.searchRefOptions(event.target);
			}, 300));
			cont.addEventListener("click", (event) => {
				event.stopPropagation(); // Prevents the click from bubbling up to the window
				this.showRefOptions(cont);
			});	
			cont.addEventListener("mouseleave", (event) => {
				// this.hideRefOptions(cont);
			});
		});
	}
	setOption(option){
		let db_ref = option.closest(".db_ref_container");
		db_ref.querySelector(".db_ref").value = option.dataset.value;
		db_ref.querySelector(".db_ref_search").value = option.textContent;
	}
	delete(row){
		console.log("Deleting row with id:", row.dataset.id);
		const formData = new FormData();
		formData.append("id", row.dataset.id);
		fetch("/db/" + this.tableName + "/delete", { method: "POST", body: formData})
			.then(res => res.json())
			.then(data => {
				if(data.success){
					row.remove();
				} else {
					console.error("Error deleting row:", data.error);
				}
			})
			.catch(error => console.error("Error:", error));
	}
	update(row){ //TODO: make a form gatherer to be used in update and insert
		console.log("Updating row with id:", row.dataset.id);
		
		const inputs = row.querySelectorAll(".db_input:not([type='submit'])");
		const form = {id: row.dataset.id};
		inputs.forEach(input => {
			if(input.type === "checkbox"){
				form[input.name] = input.checked ? 1 : 0;
			} else if(input.type === "radio"){
				if(input.checked){
					form[input.name] = input.value;
				}
			} else if(input.type === "datetime-local"){
				console.log(input.value);
				form[input.name] = new Date(input.value).toISOString();
				console.log(form[input.name]);
			}else{
				form[input.name] = input.value;
			}
		});
		ajax(null, "replace", {form: form, method: "POST", action: `/db/${this.tableName}/update`}, row);

	}
	insert(){
			const row = this.div.querySelector(".db_insert");			
			const inputs = row.querySelectorAll(".db_input:not([type='submit'])");
			const form = {};
			inputs.forEach(input => {
				if(input.type === "checkbox"){
					form[input.name] = input.checked ? 1 : 0;
				} else if(input.type === "radio"){
					if(input.checked){
						form[input.name] = input.value;
					}
				} else if(input.type === "datetime-local"){
					console.log(input.value);
					form[input.name] = new Date(input.value).toISOString();
					console.log(form[input.name]);
				}else{
					form[input.name] = input.value;
				}
			});
		ajax(null, ()=>{
			this.search();
		}, {form: form, method: "POST", action: `/db/${this.tableName}/insert`}, row);
	}
	search(event){
		ajax(event ?? this.searchForm, "inject", null, document.querySelector(`#db_${this.tableName} .db_body`));
		return false;
	}
	searchRefOptions(select){
		let container = select.nextElementSibling;
		ajax(null, ["inject", (res)=>{
			let options = container.querySelectorAll(".db_option");
			debugger;
			options.forEach(option => {
				option.addEventListener("mousedown", (event) => {
					event.preventDefault(); // Prevents the default action of the mousedown event
					event.stopPropagation(); // Stops the event from bubbling up to parent elements
					console.log("triggered");
					event.target.focus();
					
					this.setOption(event.target);
					return false;
				});
			});
			return res;
		}], {action: `/db/${this.tableName}/options/${select.dataset.field}?${(new URLSearchParams({field: select.dataset.name, search: select.value})).toString()}`, method: "GET"}, container);
	}
	showRefOptions(cont){
		this.hideRefsOptions(cont);
		cont.classList.add("shown");
	}
	hideRefOptions(cont){
		console.log("hideRefOptions called");
		
		cont.classList.remove("shown");
	}
	hideRefsOptions(cont = null){
		this.div.querySelectorAll(".db_ref_container.shown").forEach(c => {
			if (!cont || c !== cont) {
				this.hideRefOptions(c);
			}
		});
	}
}

document.querySelectorAll(".db_wrapper").forEach(table => {
	const observer = new MutationObserver((mutations) => {
		mutations.forEach(mutation => {
			mutation.addedNodes.forEach(addedNode => {
				if (addedNode.nodeType === Node.ELEMENT_NODE && addedNode.matches(".db_container")) {
					const tableName = addedNode.id.replace("db_", "");
					if (!tables[tableName]) {
						tables[tableName] = new Table(tableName);
					}
				}
			});
		});
	});
	observer.observe(table, { childList: true, subtree: true });
});