const express = require('express');
const path = require('path');
const DBEditor = require('./dbEditor');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const { Client } = require('pg');
const app = express();
const fs = require('fs');
const port = 3000;


// PostgreSQL connection setup
const client = new Client({
    host: 'localhost',
	port: 5432,
	database: 'cafefa',
	user: 'postgres',
	password: 'abcd',
});
const db = new DBEditor(client);

client.connect();

client.query(fs.readFileSync('structure.sql', 'utf8').toString(), (err, res) => {
	if (err) {
		console.error(err);
		return;
	}
});
// Serve static files from the 'public' folder
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // Move this line before expressSession
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Ensure secure is false for development
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use("/db", db.router);
app.disable('x-powered-by');

app.get('/admin', (req, res) => {
    if(req.session?.admin)
        res.render('layouts/Admin');
    else
        res.render('layouts/Login');
});

app.post('/login', (req, res) => {
    if (!req.body.password) {
        res.send('login failed');
    } else if (req.body.password === "sauce") {
        
        req.session.admin = true;
        req.session.save(err => {
            if (err) {
                return res.send('Error saving session');
            }
            res.redirect(req.body.redirect ? req.body.redirect : '/admin');
        });
    } else {
        res.send('login failed');
    }
});

app.get('/', (req, res) => {
    res.render('layouts/Index');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

