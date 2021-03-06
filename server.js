var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var app = express(); 

var PORT = process.env.PORT || 3000;

var server = app.listen(PORT, function(){
  console.log('server is up on port ' + PORT);
});

var io = require('socket.io')(server);




app.use(favicon(path.join(__dirname, 'dist/img', 'favicon.ico')));



app.use(express.static('dist'));

app.get('*.js', function (req, res, next) {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  next();
});

var codes = ['MSFT', 'AAPL', 'GOOG'  ];
io.on('connection', function(socket) {
  
  
  
  io.emit('update', codes);
  

  socket.on('removeStock', function(stock) {
    // an if statement to impede trying to delete something that doesnt exist
    if(codes.indexOf(stock) >= 0) {
      codes.splice(codes.indexOf(stock), 1);
      
      io.emit('update', codes);
    }

  })
  socket.on('addStock' , function(stock) {
    codes.push(stock);
    
    io.emit('update', codes);
})

  socket.on('disconnect' , function() {
    console.log('user disconnected');
  })
})

app.get('*', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});




