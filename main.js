const express = require('express');
const path = require('path');
const { Client } = require('pg');
const fs = require('fs');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const { log } = require('console');
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
            res.redirect('/admin');
        });
    } else {
        res.send('login failed');
    }
});
app.post('/imgupload', (req, res) => {
    if(!req.session?.admin){
        res.status(511).send({message: 'You are not authorized to upload images'});
        return ;
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({message: 'No files were uploaded.'});
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.upload;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(__dirname + '/public/srcs/imgs/' + sampleFile.name, function(err) {
        if (err)
            return res.status(500).send(err);
        res.send({message: 'File uploaded!'});
    });
});

app.get('/', (req, res) => {
    res.render('layouts/Index');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

