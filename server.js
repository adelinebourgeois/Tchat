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
var roomJoin = [];



io.sockets.on('connection', function (socket, room){ // io.sockets = tous user connecté au système
	var login = false;
	socket.emit('updaterooms', rooms, room);

	// Connexion \\
	socket.on('login', function (user){  //receptionne l'evenement
		login = user;
		socket.emit('logged');
	});

	//Multi-room \\
	socket.on('join room', function (room) {
		socket.join(room);
		socket.current_room = room;
		roomJoin.push(socket.current_room);
		socket.emit('form', room);	
	});

		socket.on('newmessage', function (message) {
			message.login = login;
			date = new Date();
			message.h = date.getHours();
			message.m = date.getMinutes();
			io.sockets.in(message.room).emit('newmessage', message);
		});

		// Deconnexion \\
		socket.on('disconnect', function () {
			io.sockets.in(socket.current_room).emit('notif', login + ' has disconnected');
			socket.leave(room);
		});
});