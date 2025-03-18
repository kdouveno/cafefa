const router = require('express').Router;

const data_types = {
	"bigint": "number",
	"bigserial": "number",
	"interval": "datetime-local",
	"date": "date",
	"timestamp": "datetime-local",
	"integer": "number"
};

function data_type(type){
	console.log(type);
	return data_types[type] ?? "text";
}

class Table {
	constructor(client, name) {
		this.client = client;
		this.name = name;
		this.client.query(`SELECT column_name, data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'${name}'`, (err, res) => {
			if (err) {
				console.error(err);
				return;
			}
			this.structure = res.rows;
			
			this.client.query(`SELECT fieldname, inputtype, template FROM fields WHERE tablename = '${name}'`, (err, res) => {
				if (err) {
					console.error(err);
					return;
				}
				let templates = {};
				for (let o of res.rows) {
					if (!templates[o.template])
						templates[o.template] = [];	
					templates[o.template].push({name: o.fieldname, input: o.inputtype});
				}
				this.templates = templates;
			});
		});
		this.setRouter();
	}
	setRouter(){
		let rtr = router();
		rtr.get("/", (req, res) => {
			res.render("views/table", {table: this.name, structure: this.templates.default});
		});
		rtr.post("/insert", (req, res) => {
			console.log(this.name + " Insert");
		});
		rtr.post("/delete", (req, res) => {
			console.log(this.name + " Delete");
		});

		this.router = rtr;
	};
}

class DBEditor {
	constructor(client) {
		const rtr = router();
		let tables = {};
		rtr.use((req, res, next) => {
			if (!req.session?.admin) {
				res.redirect(`/admin?redirect=${req.originalUrl}`);
				return;
			}
			next();
		});
		client.query(`SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' AND TABLE_SCHEMA='public'`, (err, res) => {
			if (err) {
				console.error(err);
				return;
			}
			
			for (let { table_name } of res.rows) {
				
				const table = new Table(client, table_name)
				rtr.use(`/${table_name}`, table.router);
				tables[table_name] = table;
			}
		});
		
		this.client = client;
		this.router = rtr;
		this.tables = tables;
	}
}


module.exports = DBEditor;