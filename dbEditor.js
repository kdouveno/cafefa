const router = require('express').Router;
const fs = require('fs');
const path = require('path');

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
		rtr.use((req, res, next) => {
			if (req.files) {
				req.body.$files = req.files;
			}
			next();
		});
		rtr.post("/", (req, res) => {
			this.searchRequest(this.templates.default, {}).then(body => {
				res.render("views/table", {table: this.name, template: this.templates.default, body});
			}).catch(err => {
				console.error(err);
				res.status(500).send({"Internal Server Error": err.detail});
			});
		});
		rtr.post("/search", (req, res) => {
			this.searchRequest(this.templates.default, {}).then(body => {
				res.render("views/table_body", {table: this.name, template: this.templates.default, body});
			}).catch(err => {
				console.error(err);
				res.status(500).send({"Internal Server Error": err.detail});
			});
		});
		rtr.post("/insert", (req, res) => {
			this.insertRequest(req.body).then(body => {
				res.render("views/table_body", {template: this.templates.default, body});
			}).catch(err => {
				console.error(err);
				res.status(500).send({"Internal Server Error": err.detail});
			});
		});
		rtr.post("/delete", (req, res) => {
			this.client.query(`DELETE FROM ${this.name} WHERE id = ${req.body.id}`, (err, result) => {
				if (err) {
					console.error(err);
					res.status(500).send({"Internal Server Error": err.detail});
					return;
				}
				res.send({success: true});
			});
		});
		rtr.post("/update", (req, res) => {
			console.log("Updating row with id:", req.body.id);
			let entries = Object.entries(req.body).filter(key => key !== "id");
			let queryPairs = entries.map(([key, value]) => `${key} = '${value}'`).join(", ");
			
			this.client.query(`UPDATE ${this.name} SET ${queryPairs} WHERE id = ${req.body.id} RETURNING *`, (err, result) => {
				if (err) {
					console.error(err);
					res.status(500).send({"Internal Server Error": err.detail});
					return;
				}
				res.render("views/table_body", {template: this.templates.default, body: result.rows});
			});
		});

		this.router = rtr;
	};
	insertRequest(body){
		return new Promise((resolve, reject) => {
			if (body.$files) {
				for (const fileKey in body.$files) {
					const file = body.$files[fileKey];
					if (file.mimetype.startsWith('image/')) {
						const uploadPath = path.join(__dirname, 'public', 'srcs', 'imgs', file.name);
						fs.writeFileSync(uploadPath, file.data);
						body[fileKey] = `/srcs/imgs/${file.name}`;
					}
				}
			}
			let query = `INSERT INTO ${this.name} (${Object.keys(body).join(",")}) VALUES (${Object.values(body).map(o=>`'${o}'`).join(",")})`;
			this.client.query(query, (err, res) => {
				if (err) {
					console.error(err);
					reject(err);
					return;
				}
				resolve(res.rows);
			});
		});
	}
	searchRequest(template, body){
		//todo: add search request
		return new Promise((resolve, reject) => {
			let select = this.templates.default.reduce((t, o, i)=>{
				if (o.input !== "system") {
					return t + (t ? " , " : "") + o.name;
				}
				return t;
			}, "");
			let query = `SELECT ${select} FROM ${this.name}`;
			this.client.query(query, (err, res) => {
				if (err) {
					console.error(err);
					reject(err);
					return;
				}
				resolve(res.rows);
			});
		});
	}
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