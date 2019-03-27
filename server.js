var players = {};

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
  let player = {
    id: socket.id,
    position: {
      x: Math.random() * 300,
      y: Math.random() * 300
    },
    sequence: 0
  };
  players[socket.id] = player;
  socket.emit('init', player);

  socket.on('update', function (movementData) {
    let player = players[socket.id];
    player.position.x += movementData.movement.x;
    player.position.y += movementData.movement.y;
    player.sequence = movementData.sequence;
  });

  socket.on('disconnect', function () {
    io.emit('disconnected', socket.id);
    delete players[socket.id];
  });
});

setInterval(function () {
  io.emit('update', players);
}, 100);
