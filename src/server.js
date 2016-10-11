
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

var roomNames = {};

const onSetupSockets = (sock) => {
  const socket = sock;
  socket.on('CreateRoomWithName', (data) => {
    if(roomNames[data.name] != undefined){
       socket.emit('ReceiveHostRoomCheck',{
        success: false
       });
    } else {
      
      roomNames[data.name] = {
        name: data.name,
        playerCount: 1,
        host: data.user,
        playersInLobby: {}
      };
      roomNames[data.name].playersInLobby[0] = data.userAgent
       socket.join(data.name);
       socket.emit('ReceiveHostRoomCheck',{
        success: true
       });     
    }
  });

  socket.on('FindRoomWithName', (data) => {
    if(roomNames[data.name] == undefined){
       
       socket.emit('ReceiveFindRoomCheck',{
        success: false,
        reason: "THAT ROOM DOES NOT EXIST"
       });
    } else if (roomNames[data.name].playerCount < 4) {
       socket.join(data.name);
      roomNames[data.name].playersInLobby[roomNames[data.name].playerCount] = data.user;
       socket.emit('ReceiveFindRoomCheck',{
        success: true,
        index: roomNames[data.name].playerCount,
        playersInLobby: roomNames[data.name].playersInLobby,
        host: roomNames[data.name].host
       });
      roomNames[data.name].playerCount += 1;
      socket.to(data.name).emit('NewRoomMember', roomNames[data.name].playersInLobby)
      
    } else {
      socket.emit('ReceiveFindRoomCheck',{
        success: true,
        reason: "THAT ROOM IS FULL"
       }); 
    }
  });
  
  socket.on('UpdateUsers', (data) => {
    roomNames[data.name].playersInLobby = data.players;
    socket.to(data.name).emit('UserUpdate', data.players);
  });

};

io.sockets.on('connection', (socket) => {
  onSetupSockets(socket);
});

