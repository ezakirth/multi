var users = {};

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
  let user = {
    id: socket.id,
    position: {
      x: Math.random() * 300,
      y: Math.random() * 300,
      r: 0
    },
    sequence: 0
  };
  users[socket.id] = user;
  socket.emit('init', user);

  socket.on('update', function (movementData) {
    let user = users[socket.id];
    user.position.x += movementData.movement.x;
    user.position.y += movementData.movement.y;
    user.position.r += movementData.movement.r;
    user.sequence = movementData.sequence;
  });

  socket.on('disconnect', function () {
    io.emit('disconnected', socket.id);
    delete users[socket.id];
  });

  socket.on('pingtest', function () {
    socket.emit('pongtest');
  });

});

setInterval(function () {
  io.emit('update', users);
}, 100);
