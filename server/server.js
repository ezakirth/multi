var players = {};


var io = require('socket.io')(8080);


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
