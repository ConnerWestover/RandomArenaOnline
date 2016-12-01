
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const firstPage = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(firstPage);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

const io = socketio(app);

const roomNames = {};

const onSetupSockets = (sock) => {
  const socket = sock;
  socket.on('CreateRoomWithName', (data) => {
    console.log(`Attempt To Room Created With Name: ${data.name}`);
    if (roomNames[data.name] !== undefined) {
      socket.emit('ReceiveHostRoomCheck', {
        success: false,
      });
      console.log(`Failed To Create Room With Name: ${data.name}`);
    } else {
      roomNames[data.name] = {
        name: data.name,
        playerCount: 1,
        host: data.user,
        playersInLobby: {},
      };
      console.log(`Created Room With Name: ${data.name}`);
      roomNames[data.name].playersInLobby[0] = data.userAgent;
      socket.join(data.name);
      socket.emit('ReceiveHostRoomCheck', {
        success: true,
      });
    }
  });

  socket.on('FindRoomWithName', (data) => {
    console.log(`Find Room With Name: ${data.name}`);
    if (roomNames[data.name] === undefined) {
      socket.emit('ReceiveFindRoomCheck', {
        success: false,
        reason: 'THAT ROOM DOES NOT EXIST',
      });
      console.log(`Failed With Name: ${data.name}`);
    } else if (roomNames[data.name].playerCount < 4) {
      socket.join(data.name);
      roomNames[data.name].playersInLobby[roomNames[data.name].playerCount] = data.user;
      socket.emit('ReceiveFindRoomCheck', {
        success: true,
        index: roomNames[data.name].playerCount,
        playersInLobby: roomNames[data.name].playersInLobby,
        host: roomNames[data.name].host,
      });
      console.log(`Found Room: ${data.name}`);
      roomNames[data.name].playerCount += 1;
      socket.to(data.name).emit('NewRoomMember', roomNames[data.name].playersInLobby);
    } else {
      socket.emit('ReceiveFindRoomCheck', {
        success: false,
        reason: 'THAT ROOM IS FULL',
      });
    }
  });

  socket.on('UpdateUsers', (data) => {
    roomNames[data.name].playersInLobby = data.players;
    socket.to(data.name).emit('UserUpdate', data.players);
    console.log(`Update Users in Room: ${data.name}`);
  });

  socket.on('KillRoomWithName', (name) => {
    socket.to(name).emit('ForceLeaveRoom', 'Host Disconnected');
    console.log(`Kill Room: ${name}`);
    socket.clients(name).forEach((s) => {
      s.leave(name);
    });
  });

  socket.on('StartGame', (room) => {
    socket.to(room).emit('StartPlay', {});
  });
	
	socket.on('PassInformationToPlayers', (data) =>{
		if(data != null){
			socket.emit('InformationSentCheck', {
				success: true,
			});
			socket.emit('RecieveInformation', {
				players: data.players,
				enemies: data.enemies, 
				//probably needs more, address as we go
			});
		} else {
			socket.emit('InformationSentCheck', {
				success: false,
				reason: 'DATA NOT FOUND'
			})
		}
	});
	
	socket.on('PassInputToHost', (data) =>{
		if(data != null){
			socket.emit('InputSentCheck', {
				success: true,
			});
			socket.emit('RecieveInput', {
				//stuff
			});
		} else {
			socket.emit('InputSentCheck', {
				success: false,
				reason: 'DATA NOT FOUND'
			});
		}
	});
};

io.sockets.on('connection', (socket) => {
  onSetupSockets(socket);
});

