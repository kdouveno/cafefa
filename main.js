const express = require('express');
const path = require('path');
const { Client } = require('pg');
const fs = require('fs');

const app = express();
const port = 3000;

// PostgreSQL connection setup
const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'cafefa',
    user: 'postgres',
    password: 'abcd',
});
client.connect();

client.query(fs.readFileSync('structure.sql', 'utf8').toString(), (err, res) => {
	if (err) {
		console.error(err);
		return;
	}
	console.log('Structure created successfully');
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('layouts/index');
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

