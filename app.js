
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
var moment = require('moment');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//request
app.get('/', function(req, res){
    res.render('chat-room',{});
});

/**
* SOCKET SERVER
*/

// WebSocket server
/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
var MAX_MESSAGE = 15;
// list of currently connected clients (users)
var clients = [ ];

var io   = require('socket.io');
// socket.io 
var socket = io.listen(server); 
socket.on('connection', function(client) {
	//Send list useronline
	client.emit('message',{
  		type           : "loading",
  		listChater     : clients,
		historyMessage : history
	});
  	client.on('message', function(message) {
   		var obj = JSON.parse(message);
		if(obj.type === 'login'){
			clientInfo = {
				 user : obj.user,
				 images : obj.images
			};
			client.username = obj.user;
			console.log(obj.images);
			clients.push( clientInfo );
			client.emit('message',{
  				type       : "addChater",
  				user       : obj.user,
				images     : obj.images
			});
			client.broadcast.emit('message',{
				type       : "newChater",
  				user       : obj.user,
				images     : obj.images
			});
		}
		if(obj.type === 'logout'){
			for(i=0; i<clients.length; i++) {
				if(client.username === clients[i].user){				
					client.broadcast.emit('message',{
						type       : "removeChater",
	  					user       : clients[i].user
					});
					client.emit('message',{
						type       : "logout",
	  					user       : clients[i].user
					});
					clients.splice(i, 1);
					break;
				}
			}
		}
		if(obj.type === 'addMessage'){
			var a = moment.utc();
			obj.time = a.hours()+":"+a.minutes();
			
			client.broadcast.emit('message',{
				type       : "addMessage",
	  			data       : obj
			});
			client.emit('message',{
				type       : "addMessage",
	  			data       : obj
			});
			history.push(obj);
			if(history.length >= MAX_MESSAGE)
				history.splice(-MAX_MESSAGE);
			console.log("history:"+history.length);
		}
  	}); 
  	client.on('disconnect', function() {
		console.log("disconnect");
		for(i=0; i<clients.length; i++) {
			if(client.username === clients[i].user){				
				client.broadcast.emit('message',{
					type       : "removeChater",
  					user       : clients[i].user
				});
				clients.splice(i, 1);
				break;
			}
		}
		
	});
});
