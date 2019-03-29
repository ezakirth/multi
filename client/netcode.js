var startTime, latency, lastServerTimestamp = 0;

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


setInterval(function () {
    let user = users[userId];
    if (user) {
        sendMovementData(user);
    }
}, 100);


function sendMovementData(user) {
    // get movement since last one sent to server
    let deltaPosition = {
        x: user.position.x - user.lastPosition.x,
        y: user.position.y - user.lastPosition.y,
        dx: user.direction.x - user.lastPosition.dx,
        dy: user.direction.y - user.lastPosition.dy,
    }

    // If there was movement, notify the server
    if (Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaPosition.dx) + Math.abs(deltaPosition.dy) > 0) {
        user.lastPosition = { x: user.position.x, y: user.position.y, dx: user.direction.x, dy: user.direction.y };
        // send movement to server for validation
        let movementData = { movement: deltaPosition, sequence: ++user.sequence };
        socket.emit('update', movementData);

        // store movements for later reconciliation
        user.pendingMovement.push(movementData);
    }
}

var last = 0;
socket.on('update', function (data) {
    serverDelay = last * 1000;
    last = 0;

    lastServerTimestamp = data.timestamp;
    let serverUsers = data.users;
    for (let id in serverUsers) {
        let playerData = serverUsers[id];
        if (!users[id]) {
            users[id] = new User(playerData.id, playerData.position);
        }

        let user = users[id];

        if (id == userId) {

            // if there was moment between last server update, send it now
            sendMovementData(user)

            // Received the authoritative position of this client's user.
            user.position.x = playerData.position.x;
            user.position.y = playerData.position.y;
            user.direction.x = playerData.direction.x;
            user.direction.y = playerData.direction.y;


            // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
            var j = 0;
            while (j < user.pendingMovement.length) {
                let movementData = user.pendingMovement[j];
                if (movementData.sequence <= playerData.sequence) {
                    // Already processed. Its effect is already taken into account into the world update
                    // we just got, so we can drop it.
                    user.pendingMovement.splice(j, 1);
                } else {
                    user.position.x += movementData.movement.x;
                    user.position.y += movementData.movement.y;
                    user.direction.x += movementData.movement.dx;
                    user.direction.y += movementData.movement.dy;
                    j++;
                }
            }

        } else {
            // Received the position of an user other than this client's.

            // Add it to the position buffer.
            user.positionBuffer.push({ timestamp: new Date(), position: playerData.position, direction: playerData.direction });
        }
    }

});
