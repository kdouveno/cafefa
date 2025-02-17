const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

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