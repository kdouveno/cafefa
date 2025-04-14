tables = {};
class Table {
	constructor(tableName){
		this.tableName = tableName;
		this.table = document.querySelector(`#db_${tableName} .db_table`);
		let mut = new MutationObserver((mutations) => {
			console.log("Table mutation observer triggered:", mutations);
			mutations.forEach(m=>{	
				m.addedNodes.forEach(node => {
					let del;
					if (node.querySelector && (del = node.querySelector(".db_delete")))
						del.addEventListener("click", () => this.delete(node));
				});
			});
		});
		mut.observe(this.table.querySelector("tbody"), { childList: true, subtree: true });
		this.rows = this.table.querySelectorAll("tbody tr");
		this.insertForm = document.getElementById(`db_${tableName}_insert`);
		this.updateForm = document.getElementById(`db_${tableName}_update`);
		this.searchForm = document.getElementById(`db_${tableName}_search`);
		if (!(this.insertForm && this.updateForm && this.searchForm)) {
			throw new Error(`Forms not found for table ${tableName}`);
		}
		tables[this.tableName] = this;
		this.initSubmits();

	}
	initSubmits(){
		this.insertForm.addEventListener("submit", (event) => ajax(event, ["inject", ()=>{
				this.search();
			}], null, document.querySelector(`#db_${this.tableName} .db_insert .res`)));
		this.updateForm.addEventListener("submit", (event) => this.update(event));
		this.searchForm.addEventListener("submit", (event) => this.search(event));
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
	update(){
		
		event.preventDefault();
		const row = event.target.closest("tr");
		if(!row) return;
		const id = row.dataset.id;
		const inputs = row.querySelectorAll("input");
		for (let input of inputs){
			input.setProperty("form", `db_${this.tableName}_update`);
		}
		const formData = new FormData(document.querySelector(`#db_${this.tableName}_update`));
		formData.append("id", id);
		fetch("/db/" + this.tableName + "/update", { method: "POST", body: formData})
			.then(res => res.json())
			.then(data => {
				if(data.success){
					row.innerHTML = data.html;
				} else {
					console.error("Error updating row:", data.error);
				}
			})
			.catch(error => console.error("Error:", error));
	}
	search(event){
		ajax(event ?? this.searchForm, "inject", null, document.querySelector(`#db_${this.tableName} tbody`));
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