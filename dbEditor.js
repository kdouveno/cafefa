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
			
			this.client.query(`SELECT fieldname, inputtype, template, ref FROM fields WHERE tablename = '${name}'`, (err, res) => {
				if (err) {
					console.error(err);
					return;
				}
				let templates = {};
				for (let o of res.rows) {
					if (!templates[o.template])
						templates[o.template] = [];	
					templates[o.template].push({name: o.fieldname, input: o.inputtype, ref: o.ref});
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
			let entries = Object.entries(req.body).filter(key => key !== "id");

			let queryPairs = entries.map(([key, value]) => `${key} = '${value}'`).join(", ");

			this.client.query(`UPDATE ${this.name} SET ${queryPairs} WHERE id = ${req.body.id}`, (qerr, qres) => {
				if (qerr) {
					console.error(qerr);
					res.status(500).send({"Internal Server Error": qerr.detail});
					return;
				}
				this.searchRequest(this.templates.default, {}, req.body.id).then(result => {
					if (result.length === 0) {
						res.status(404).send({"Not Found": "No record found with the given ID."});
						return;
					}
					res.render("views/table_body", {template: this.templates.default, body: result});
				}).catch(err => {
					console.error(err);
					res.status(500).send({"Internal Server Error": err.detail});
				});
			});
		});
		rtr.get("/options/:field", (req, res) => {
			this.optionsRequest(req.params.field, req.query.field, req.query.search, req.query.template).then(body => {
				res.render("views/options", {options: body});
			}).catch(err => {
				console.error(err);
				res.status(500).send({"Internal Server Error": err.detail});
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
			const pairs = Object.entries(body).filter(([key, value]) => key !== "id" && value !== "");
			const query = `INSERT INTO ${this.name} (${Object.keys(pairs).join(",")}) VALUES (${Object.values(pairs).map(o=>`'${o}'`).join(",")})`;
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
	searchRequest(template, body, id = null){
		//todo: add search request	
		return new Promise((resolve, reject) => {
			let joins = [];
			let select = this.templates.default.reduce((t, o, i)=>{
				let a;
				if (o.input === "ref") {
					if (o.ref){
						let [table, field] = o.ref.split('.');
						t += `${t ? ', ': ''}(${o.ref}) AS "${o.ref}"`;
						joins.push({table, field, name: o.name});
					} else
						return t;
				}
				if (o.input !== "system") 
					a = this.name + '.' + o.name;
				else
					return t;
				if (t)
					a = `, ${a}`;
				return t + a;
			}, "");
			if (joins.length > 0)
				joins = joins.map(join => `LEFT JOIN ${join.table} ON ${this.name}.${join.name} = ${join.table}.id`).join(" ");
				let query = `SELECT ${select} FROM ${this.name} ${joins} ${id ? `WHERE ${this.name}.id = '${id}'` : ''}`; //todo ducktape 'where' to revamp

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
	optionsRequest(target, field, search, template = "default") {

		return new Promise((resolve, reject) => {
			let [ttable, tfield] = target.split('.');
			let ref;
			if (this.templates[template] && (ref = this.templates[template].find(o => o.name === field)) && ref.ref === target) {
				this.client.query(`SELECT id, ${tfield} FROM ${ttable} WHERE ${tfield} ILIKE $1`, [`%${search}%`], (err, res) => {
					if (err) {
						console.error(err);
						reject(err);
						return;
					}
					resolve(res.rows);
				});
			}
		});
	}
	getOptions(field, template = "default") {
		
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
		client.query('SET TIME ZONE \'UTC\'', (err) => {
			if (err) {
				console.error('Error setting time zone:', err);
			} else {
				console.log('Time zone set to UTC');
			}
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