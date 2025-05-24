tables = {};
class Table {
	constructor(tableName){
		this.tableName = tableName;
		this.div = document.getElementById(`db_${tableName}`);
		this.table = this.div.querySelector(`.db_table`);
		let mut = new MutationObserver((mutations) => {
			mutations.forEach(m=>{	
				m.addedNodes.forEach(node => {
					if (node.nodeType !== Node.ELEMENT_NODE || !node.matches(".db_row")) return;
					let del;
					del = node.querySelector(".db_delete")
					if (node.querySelector && del)
						del.addEventListener("click", () => this.delete(node));
					del = node.querySelector(".db_update")
					if (node.querySelector && del)
						del.addEventListener("click", () => this.update(node));
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
		document.querySelectorAll(`#db_${this.tableName} .db_input.db_update`).forEach(input => {
			input.addEventListener("click", (event) => {
				event.preventDefault();
				this.update(event.target.closest(".db_row"));
				return false;
			});
		});
		document.querySelectorAll(`#db_${this.tableName} .db_input.db_delete`).forEach(input => {
			input.addEventListener("click", (event) => {
				this.delete(event.target.closest(".db_row"));
			});
		});
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