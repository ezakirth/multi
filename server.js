class Client {
  constructor(clientId) {
    this.position = {
      x: Math.random() * 300,
      y: Math.random() * 300
    };
    this.direction = { x: 1, y: 0 };
    this.networkData = {
      clientId: clientId,
      sequence: 0
    };
  }
}
var clients = {};
var history = {};

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

io.on('connection', function (socket) {
  let client = new Client(socket.id);
  clients[client.networkData.clientId] = client;
  socket.emit('init', client);

  socket.on('update', function (movementData) {
    let client = clients[socket.id];
    client.position.x += movementData.movement.x;
    client.position.y += movementData.movement.y;
    client.direction.x += movementData.movement.dx;
    client.direction.y += movementData.movement.dy;
    client.networkData.sequence = movementData.sequence;
  });

  socket.on('disconnect', function () {
    io.emit('disconnected', socket.id);
    delete clients[socket.id];
  });

  socket.on('pingtest', function () {
    socket.emit('pongtest');
  });

});

setInterval(function () {
  let timestamp = +new Date();
  history[timestamp] = JSON.parse(JSON.stringify(clients));

  let list = Object.keys(history);

  if (list.length > 10) {
    delete history[list[0]];
  }

  io.emit('update', { timestamp: timestamp, clients: clients });
}, 100);
