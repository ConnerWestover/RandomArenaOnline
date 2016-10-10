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

const onUpdateUser = (sock) => {
  const socket = sock;
  socket.on('addUser', (data) => {
    socket.broadcast.emit('updateUser', data);
  });

  socket.on('update', (data) => {
    socket.broadcast.emit('updateUser', data);
  });

  socket.on('updateBullet', (data) => {
    socket.broadcast.emit('bullet', data);
  });
  socket.on('addBullet', (data) => {
    socket.broadcast.emit('bullet', data);
  });
};

io.sockets.on('connection', (socket) => {
  // console.log('Connected');
  onUpdateUser(socket);
});

