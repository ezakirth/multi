var startTime, latency;

socket.on('pongtest', function () {
    latency = Date.now() - startTime;
    document.getElementById('ping').innerText = latency + 'ms';
});

setInterval(function () {
    startTime = Date.now();
    socket.emit('pingtest');
}, 2000);


socket.on('init', function (user) {
    userId = user.id;
    users[userId] = new User(user.id, user.position);
});

socket.on('disconnected', function (id) {
    delete users[id];
});

socket.on('update', function (data) {
    for (let id in data) {
        let playerData = data[id];
        if (!users[id]) {
            users[id] = new User(playerData.id, playerData.position);
        }

        let user = users[id];

        if (id == userId) {
            // Received the authoritative position of this client's user.
            user.position = playerData.position;

            // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
            var j = 0;
            while (j < pendingMovement.length) {
                var movementData = pendingMovement[j];
                if (movementData.sequence <= playerData.sequence) {
                    // Already processed. Its effect is already taken into account into the world update
                    // we just got, so we can drop it.
                    pendingMovement.splice(j, 1);
                } else {
                    user.position.x += movementData.movement.x;
                    user.position.y += movementData.movement.y;
                    user.position.r = movementData.movement.r;
                    j++;
                }
            }

        } else {
            // Received the position of an user other than this client's.

            // Add it to the position buffer.
            user.positionBuffer.push({ timestamp: new Date(), position: playerData.position });
        }
    }

});
