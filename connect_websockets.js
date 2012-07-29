// P2P Stuff
var io = require('socket.io').listen(app)

io.set('log level', 1);
io.sockets.on('connection', function(socket)
{
	socket.on('joiner', function(data)
	{
		var len = io.sockets.clients(data).length;

		if(len > 1)
			socket.emit('warn', "This connection is full. Please try later.");
		else
		{
			socket.join(data);
			socket.room = data;

			if(len == 1)
			{
				socket.peer = io.sockets.clients(data)[0];
	
				if(socket.peer != undefined)
				{
					// Notify to both peers that we are connected
					socket.emit('peerconnected');
					socket.peer.emit('peerconnected');

					// Interchange files lists
					if(socket.peer.fileslist != undefined)
						socket.emit('fileslist', socket.peer.fileslist);

					// Set this socket as the other socket peer
					socket.peer.peer = socket;
				}
			}
		}

		// Tell all clients on the room that a new peer has joined
		io.sockets.in(data).emit('info', socket.id + " joined!");
	});

	socket.on('disconnect', function()
	{
        if(socket.peer != undefined)
	   	    socket.peer.emit('peerdisconnected');
	});

	socket.on('listfiles', function(data)
	{
		socket.fileslist = data;

		if(socket.peer != undefined)
			socket.peer.emit('fileslist', data);
	});

	socket.on('begintransfer', function(file, chunk)
	{
		if(socket.peer != undefined)
			socket.peer.emit('begintransfer', file, chunk);
	});

	socket.on('datatransfer', function (data, file, chunk)
	{
		if(socket.peer != undefined)
			socket.peer.emit('datatransfer', data, file, chunk);
	});
});
