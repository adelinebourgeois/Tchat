//Se connecter à socket.io
var socket = io.connect('http://localhost:1337');

(function($) {
	var msg = $("#msg").html();
	$("#msg").remove();
	$('#form').fadeOut();
	$('#connect').fadeOut();

    socket.on('form', function() {

        $('#connect').fadeIn();
    })

	$("#connect").submit(function (e){
		e.preventDefault();
		socket.emit('login', { // envoie un événement au serveur
			username : $('#login').val()
		})
	});
	socket.on('logged', function(){
		$('#connect').fadeOut(); // une fois connecté retire le formulaire pseudo
		$('#form').fadeIn();
	});

	// NOTIF \\
	socket.on('notif', function (data){
		$('#notif').append('<p> ' + data + '</p></br>');
	});

	//Envoi message 
	$("#form").submit(function (e){
		e.preventDefault();
		socket.emit('newmessage', { // envoie un événement au serveur
			message : $('#message').val()
		});
	});

	socket.on('newmessage', function (message){
		Mustache.render(msg, message);
		$('#messages').append('<div class="message">' + Mustache.render(msg, message) + '</div>')
		$('#messages').animate({scrollTop : $('#messages').prop('scrollHeight')}, 500); // nouveau msg , scoll vers le bas
	});

	// Multi-room \\

	socket.on('updaterooms', function(rooms) {
		$.each(rooms, function(key, value) {
				$('#channel').append('<div><a href="#" onclick="socket.emit(\'join room\', \''+value+'\')">'+value+'</a></div>');
		});
	});

})(jQuery);