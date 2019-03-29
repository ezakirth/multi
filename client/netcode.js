var startTime, latency, lastServerTimestamp = 0;

socket.on('pongtest', function () {
    latency = Date.now() - startTime;
    document.getElementById('ping').innerText = latency + 'ms';
});

setInterval(function () {
    startTime = Date.now();
    socket.emit('pingtest');
}, 2000);


socket.on('init', function (client) {
    clientId = client.id;
    clients[clientId] = new Client(client.id, client.position);
});

socket.on('disconnected', function (id) {
    delete clients[id];
});


setInterval(function () {
    let client = clients[clientId];
    if (client) {
        sendMovementData(client);
    }
}, 100);


function sendMovementData(client) {
    // get movement since last one sent to server
    let deltaPosition = {
        x: client.position.x - client.lastPosition.x,
        y: client.position.y - client.lastPosition.y,
        dx: client.direction.x - client.lastPosition.dx,
        dy: client.direction.y - client.lastPosition.dy,
    }

    // If there was movement, notify the server
    if (Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaPosition.dx) + Math.abs(deltaPosition.dy) > 0) {
        client.lastPosition = { x: client.position.x, y: client.position.y, dx: client.direction.x, dy: client.direction.y };
        // send movement to server for validation
        let movementData = { movement: deltaPosition, sequence: ++client.sequence };
        socket.emit('update', movementData);

        // store movements for later reconciliation
        client.pendingMovement.push(movementData);
    }
}

socket.on('update', function (data) {
    let timestamp = +new Date();

    timer.setServerDelay(timestamp);

    lastServerTimestamp = data.timestamp;
    let serverUsers = data.clients;
    for (let id in serverUsers) {
        let playerData = serverUsers[id];
        if (!clients[id]) {
            clients[id] = new Client(playerData.id, playerData.position);
        }

        let client = clients[id];

        if (id == clientId) {

            // if there was movement since the last server update, send it now
            sendMovementData(client)

            // Received the authoritative position of this client's client.
            client.position.x = playerData.position.x;
            client.position.y = playerData.position.y;
            client.direction.x = playerData.direction.x;
            client.direction.y = playerData.direction.y;


            // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
            var j = 0;
            while (j < client.pendingMovement.length) {
                let movementData = client.pendingMovement[j];
                if (movementData.sequence <= playerData.sequence) {
                    // Already processed. Its effect is already taken into account into the world update
                    // we just got, so we can drop it.
                    client.pendingMovement.splice(j, 1);
                } else {
                    client.position.x += movementData.movement.x;
                    client.position.y += movementData.movement.y;
                    client.direction.x += movementData.movement.dx;
                    client.direction.y += movementData.movement.dy;
                    j++;
                }
            }

        } else {
            // Received the position of an client other than this client's.

            // Add it to the position buffer.
            client.positionBuffer.push({ timestamp: timestamp, position: playerData.position, direction: playerData.direction });
        }
    }

});
