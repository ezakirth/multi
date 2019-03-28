class User {
  constructor(id) {
    this.id = id;
    this.position = {
      x: Math.random() * 300,
      y: Math.random() * 300,
      r: 0
    };
    this.sequence = 0;
  }
}
var users = {};
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
  let user = new User(socket.id);
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
  let timestamp = +new Date();
  history[timestamp] = JSON.parse(JSON.stringify(users));

  let list = Object.keys(history);

  if (list.length > 10) {
    delete history[list[0]];
  }

  io.emit('update', { timestamp: timestamp, users: users });
}, 100);
