 //Crée un mini-serveur qui renvoie un message

var http = require('http'); //appel bibliothèque node , bibliothèque "http" / var http représente un objet


var server = http.createServer(function (req, res) { // fonction de callback / req = objet -> info que le visiteur a demandé
  res.writeHead(200);	// 200 = tout va bien      // res = objet -> a remplir pour donner un retour au visiteur
  res.end('Salut tout le monde !');
});
server.listen(1337); // serveur lancé sur le port 8080

var io = require('socket.io').listen(server);
var users = {}; // var contenant tous mes utilisateurs
var messages = {}; //tableau de msg
var rooms = ['room1', 'room2'];
var current_room;



io.sockets.on('connection', function (socket, room){ // io.sockets = tous user connecté au système
	var login = false;
	console.log('new user');
	socket.emit('updaterooms', rooms, room);

	// Connexion \\
	socket.on('login', function (user){  //receptionne l'evenement
		login = user;
		socket.emit('logged');
	});


	//Multi-room \\
	socket.on('join room', function (room) {
		socket.leave(current_room);
		socket.join(room);
		current_room = room;
		console.log(current_room);
		contain = getDataRoom(current_room);
		// console.log(contain);
        socket.in(room).emit('notif', 'you have connected to' + room );
        socket.broadcast.to(room).emit('notif',  login + ' has connected to this room');
        console.log('connected to ' + room);

		socket.emit('form');

		socket.on('newmessage', function (message){
			message.login = login;
			// console.log(login);
			date = new Date();
			message.h = date.getHours();
			message.m = date.getMinutes();
			contain = getDataRoom(room);
			contain.push(message);
			// console.log(contain);
			io.sockets.in(room).emit('newmessage', message);
			// console.log(JSON.stringify(message) + ' dans la ' + room);
		});

		// Deconnexion \\
		socket.on('disconnect', function(){
			delete users[login];
			io.sockets.emit('updateusers', users);
			socket.broadcast.emit('notif', login + 'has disconnected');
			socket.leave(room);
		})
	});

	function getDataRoom(r){
		if(!messages[r]){ messages[r] = []; }
		console.log(messages[r]);
		return messages[r];
	}
});