var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser= require('body-parser');
var app = express(); 

var PORT = process.env.PORT || 3000;

var server = app.listen(PORT, function(){
  console.log('server is up on port ' + PORT);
});

var io = require('socket.io')(server);



var mongoose = require('mongoose');
require('dotenv').config();

// https://www.quandl.com/api/v3/datasets/WIKI/FB.json?api_key=8TZgcVZUcVLzS2EUsioo
// app.use(favicon(path.join(__dirname, 'dist/img', 'favicon.ico')));


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use(express.static('dist'));

app.get('*.js', function (req, res, next) {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  next();
});

var codes = ['MSFT', 'AAPL', 'GOOG'  ];
io.on('connection', function(socket) {
  console.log('a user connect');
  
  
  io.emit('update', codes);
  

  socket.on('removeStock', function(stock) {
    codes.splice(codes.indexOf(stock), 1);
    console.log('remove', codes);
    io.emit('update', codes);
  })
  socket.on('addStock' , function(stock) {
    codes.push(stock);
    console.log(codes);
    io.emit('update', codes);
})
  socket.on('new', function(msg) {
    console.log(msg);
  })

  socket.on('disconnect' , function() {
    console.log('user disconnected');
  })
})

app.get('*', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});




