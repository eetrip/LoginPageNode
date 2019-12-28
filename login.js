var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "root"
});
  
con.connect(function(err) {
	if (err) throw err;
	con.query("CREATE DATABASE IF NOT EXISTS xelpapp", function (err, result) {
	  if (err) throw err;
	  console.log("Database created");
	});
});

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'xelpapp'
});

connection.connect(function(err) {
    if (err) throw err;
	console.log("Connected!");

	var sql = "CREATE TABLE IF NOT EXISTS user (username VARCHAR(255), phone VARCHAR(255), email VARCHAR(255), password VARCHAR(255))";
  		connection.query(sql, function (err, result) {
    	if (err) throw err;
    	console.log("Table created");
  	});
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/signup', function(request, response) {
	response.sendFile(path.join(__dirname + '/signup.html'));
});


app.post('/signup', function(request, response){
	var username = request.body.username;
	var phone = request.body.phone;
	var email = request.body.email;
	var password = request.body.password;
    var users={
		username,
		phone,
		email,
		password
	}
    connection.query('INSERT INTO user SET ?',users, function (error, results, fields) {
      if (error) {
        response.json({
            status:false,
            message:'there are some error with query'
        })
      }else{
		response.redirect('/login');
      }
	});
});


app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/dashboard');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}

	app.get('/dashboard', function(request, response) {
		response.sendFile(path.join(__dirname + '/dashboard.html'));
	});
});

app.listen(5000);