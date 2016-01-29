//Se connecter à socket.io
var socket = io.connect('http://localhost:1337');

(function ($) {
	window.roomsMessages = {};
	var msg = $("#msg").html();
	$("#msg").remove();
	$('#form').fadeOut();
	$('#connect').fadeOut();
	var pseudoEnvoye = false;
	var roomJoin = [];

    socket.on('form', function (room) {
        if (pseudoEnvoye === false) {
        	$('#connect').fadeIn();
        }
        $('.message').remove();
        $('#message').val('');
        localStorage.setItem('room', room);
        var getFromStorage = window.roomsMessages[localStorage.getItem('room')];
        if (getFromStorage) {
        	for (var i = 0; i < getFromStorage.length; i++) {
	        	$('#messages').append($(getFromStorage[i]));
	        }
        }
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
	socket.on('notif ', function (data) {
		$('#notif').append('<p> ' + data + '</p></br>');
	});

	//Envoi message 
	$("#send-message").click(function (e) {
		socket.emit('newmessage', { // envoie un événement au serveur
			message : $('#message').val(),
			room: window.current_room
		});
		if($('#message').val().match(/^\/join(.*)$/)) {
			var channel = $('#message').val().match(/^\/join(.*)$/);
			socket.emit('join room', channel[1]);
		} else {
			return false;
		}
		pseudoEnvoye = true;
		e.preventDefault();
	});

	socket.on('newmessage', function (message) {
		Mustache.render(msg, message);
		if(message.room === window.current_room) {
			$('#message').val('');
			$('#messages').append('<div class="message" data-room="' + localStorage.getItem('room') + '">' + Mustache.render(msg, message) + '</div>');
			$('#messages').animate({scrollTop : $('#messages').prop('scrollHeight')}, 500); // nouveau msg , scoll vers le bas
			var msgCurrentRoom = document.querySelectorAll('*[data-room="' + localStorage.getItem('room') + '"');
			window.roomsMessages[localStorage.getItem('room')] = msgCurrentRoom;
		} else {
			// window.roomsMessages[message.room] = !Array.isArray(window.roomsMessages[message.room]) ? window.roomsMessages[message.room] : [];
			if (!Array.isArray(window.roomsMessages[message.room]) && typeof window.roomsMessages[message.room] === "object") {
				window.roomsMessages[message.room] = $.makeArray(window.roomsMessages[message.room]);
			} else {
				window.roomsMessages[message.room] = window.roomsMessages[message.room] || [];
			}
			window.roomsMessages[message.room].push('<div class="message" data-room="' + message.room + '">' + Mustache.render(msg, message) + '</div>');
		}
	});

	// Multi-room \\

	socket.on('updaterooms', function(rooms) {
		$.each(rooms, function(key, value) {
			$('#channel').append('<div><a class="room" href="#" onclick="socket.emit(\'join room\', \'' + value + '\'); active(event);">'+value+'</a></div>');
		});
	});

	$(window).unload(function () {
		socket.emit('disconnect');
	});
	
})(jQuery);