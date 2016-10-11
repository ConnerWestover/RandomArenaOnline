
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
        host: data.user
      };
       socket.join(data.name);
       socket.emit('ReceiveHostRoomCheck',{
        success: true
       });     
    }
  });

  socket.on('FindRoomWithName', (name) => {
    if(roomNames[name] == undefined){
       
       socket.emit('ReceiveFindRoomCheck',{
        success: false,
        reason: "THAT ROOM DOES NOT EXIST"
       });
    } else if (roomNames[name].playerCount < 4) {
       socket.join(name);
      roomNames[name].playerCount += 1;
       socket.emit('ReceiveFindRoomCheck',{
        success: true,
        index: roomNames[name].playerCount
       });     
    } else {
      socket.emit('ReceiveFindRoomCheck',{
        success: true,
        reason: "THAT ROOM IS FULL"
       }); 
    }
  });

};

io.sockets.on('connection', (socket) => {
  onSetupSockets(socket);
});

