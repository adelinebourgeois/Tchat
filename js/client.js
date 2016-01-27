//Se connecter à socket.io
var socket = io.connect('http://localhost:1337');

(function ($) {
	var roomsMessages = {};
	var msg = $("#msg").html();
	$("#msg").remove();
	$('#form').fadeOut();
	$('#connect').fadeOut();
	var current_room;
	var pseudoEnvoye = false;
	var roomJoin = [];

    socket.on('form', function (room) {
        if (pseudoEnvoye === false) {
        	$('#connect').fadeIn();
        }
        $('.message').remove();
        $('#message').val('');
        localStorage.setItem('room', room);
        var getFromStorage = roomsMessages[localStorage.getItem('room')];
        $('#messages').append(getFromStorage);
    });

	$("#connect").submit(function (e) {
		e.preventDefault();
		socket.emit('login', { username : $('#login').val() });
		pseudoEnvoye = true;
	});

	socket.on('logged', function () {
		$('#connect').fadeOut(); // une fois connecté retire le formulaire pseudo
		$('#form').fadeIn();
	});

	// NOTIF \\
	socket.on('notif ', function (data){
		console.log(data); // TODO: notif while unload
		$('#notif').append('<p> ' + data + '</p></br>');
	});

	//Envoi message 
	$("#form").submit(function (e) {
		e.preventDefault();
		socket.emit('newmessage', { // envoie un événement au serveur
			message : $('#message').val()
		});
		pseudoEnvoye = true;
	});

	socket.on('newmessage', function (message){
		Mustache.render(msg, message);
		$('#messages').append('<div class="message" data-room="' + localStorage.getItem('room') + '">' + Mustache.render(msg, message) + '</div>')
		$('#messages').animate({scrollTop : $('#messages').prop('scrollHeight')}, 500); // nouveau msg , scoll vers le bas
		var msgCurrentRoom = $('*[data-room="' + localStorage.getItem('room') + '"');
		roomsMessages[localStorage.getItem('room')] = msgCurrentRoom;
	});

	// Multi-room \\

	socket.on('updaterooms', function(rooms) {
		$.each(rooms, function(key, value) {
			$('#channel').append('<div><a class="room" href="#" onclick="socket.emit(\'join room\', \'' + value + '\'); active(event); roomJoin.push('+ value +')">'+value+'</a></div>');
		});
	});

	$(window).unload(function () {
		socket.emit('disconnect');
	});
	
})(jQuery);