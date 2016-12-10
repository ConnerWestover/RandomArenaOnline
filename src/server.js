
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
    if (roomNames[data.name] !== undefined) {
      socket.emit('ReceiveHostRoomCheck', {
        success: false,
      });
    } else {
      const lobby = [];
      lobby[0] = (data.user);
      roomNames[data.name] = {
        name: data.name,
        playerCount: 1,
        host: data.user,
        playersInLobby: lobby,
      };
      roomNames[data.name].playersInLobby[0] = data.userAgent;
      socket.join(data.name);
      socket.emit('ReceiveHostRoomCheck', {
        success: true,
      });
    }
  });

  socket.on('FindRoomWithName', (data) => {
    if (roomNames[data.name] === undefined) {
      socket.emit('ReceiveFindRoomCheck', {
        success: false,
        reason: 'THAT ROOM DOES NOT EXIST',
      });
    } else if (roomNames[data.name].playerCount < 4) {
      socket.join(data.name);
      roomNames[data.name].playersInLobby[roomNames[data.name].playerCount] = data.user;
      socket.emit('ReceiveFindRoomCheck', {
        success: true,
        index: roomNames[data.name].playerCount,
        playersInLobby: roomNames[data.name].playersInLobby,
        host: roomNames[data.name].host,
        room: data.name,
      });
      roomNames[data.name].playerCount += 1;
      socket.to(data.name).emit('NewRoomMember', roomNames[data.name].playersInLobby);
    } else {
      socket.emit('ReceiveFindRoomCheck', {
        success: false,
        reason: 'THAT ROOM IS FULL',
      });
    }
  });

  socket.on('FindAnOpenRoom', (data) => {
    for (name in roomNames) {
      if (roomNames[name].playerCount < 4) {
        socket.join(name);
        roomNames[name].playersInLobby[roomNames[name].playerCount] = data.user;
        socket.emit('ReceiveFindRoomCheck', {
          success: true,
          index: roomNames[name].playerCount,
          playersInLobby: roomNames[name].playersInLobby,
          host: roomNames[name].host,
          room: name,
        });
        roomNames[name].playerCount += 1;
        socket.to(name).emit('NewRoomMember', roomNames[name].playersInLobby);
      }
    }
  });

  // Menu use only
  socket.on('UpdateUsers', (data) => {
    roomNames[data.name].playersInLobby = data.players;
    socket.to(data.name).emit('UserUpdate', data.players);
  });

  socket.on('LeaveRoom', (data) => {
    const room = roomNames[data.name];
    const playersInLobby = room.playersInLobby;
    const index = data.user.index;
    playersInLobby[index] = undefined;
    for (let i = index; i < playersInLobby.length - 1; i += 1) {
      playersInLobby[i] = playersInLobby[i + 1];
      playersInLobby[i].index = i;
      playersInLobby[i + 1] = undefined;
    }
    room.playersInLobby = playersInLobby;
    socket.to(data.name).emit('UserUpdate', data.players);
    socket.leave(data.room);
  });

  socket.on('HostUpdatesGameInfo', (data) => {
    socket.to(data.room).emit('PlayersReceiveGameInfo', data);
  });

  socket.on('KillRoomWithName', (name) => {
    roomNames[name] = undefined;
    socket.leave(name);
  });

  socket.on('StartGame', (room) => {
    socket.to(room).emit('StartPlay', {});
  });


  socket.on('GetGameRoomInfo', (room) => {
    const data = {
      numPlayers: roomNames[room].playerCount,
      playersFromLobby: roomNames[room].playersInLobby,
      name: room,
    };

    socket.emit('ReceiveGameRoomInfo', data);
  });

  socket.on('UserSendsInputToHost', (data) => {
    socket.to(data.room).emit('HostReceivesUserInput', data);
  });
};


io.sockets.on('connection', (socket) => {
  onSetupSockets(socket);
});
