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
    localClientId = client.networkData.clientId;
    clients[localClientId] = new Client(localClientId, client.position);
});

socket.on('disconnected', function (clientId) {
    delete clients[clientId];
});


setInterval(function () {
    let client = clients[localClientId];
    if (client) {
        sendMovementData(client);
    }
}, 100);


function sendMovementData(client) {
    // get movement since last one sent to server
    let deltaPosition = {
        x: client.position.x - client.networkData.lastPosition.x,
        y: client.position.y - client.networkData.lastPosition.y,
        dx: client.direction.x - client.networkData.lastPosition.dx,
        dy: client.direction.y - client.networkData.lastPosition.dy,
    }

    // If there was movement, notify the server
    if (Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaPosition.dx) + Math.abs(deltaPosition.dy) > 0) {
        client.networkData.lastPosition = { x: client.position.x, y: client.position.y, dx: client.direction.x, dy: client.direction.y };
        // send movement to server for validation
        let movementData = { movement: deltaPosition, sequence: ++client.networkData.sequence };
        socket.emit('update', movementData);

        // store movements for later reconciliation
        client.networkData.pendingMovement.push(movementData);
    }
}

socket.on('update', function (data) {
    let timestamp = +new Date();
    time.setServerDelay(timestamp);

    lastServerTimestamp = data.timestamp;
    let serverUsers = data.clients;
    for (let clientId in serverUsers) {
        let playerData = serverUsers[clientId];
        if (!clients[clientId]) {
            clients[clientId] = new Client(playerData.networkData.clientId, playerData.position);
        }

        let client = clients[clientId];

        if (clientId == localClientId) {

            // if there was movement since the last server update, send it now
            sendMovementData(client)

            // Received the authoritative position of this client's client.
            client.position.x = playerData.position.x;
            client.position.y = playerData.position.y;
            client.direction.x = playerData.direction.x;
            client.direction.y = playerData.direction.y;


            // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
            var j = 0;
            while (j < client.networkData.pendingMovement.length) {
                let movementData = client.networkData.pendingMovement[j];
                if (movementData.sequence <= playerData.networkData.sequence) {
                    // Already processed. Its effect is already taken into account into the world update
                    // we just got, so we can drop it.
                    client.networkData.pendingMovement.splice(j, 1);
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
            client.networkData.positionBuffer.push({ timestamp: timestamp, position: playerData.position, direction: playerData.direction });
        }
    }

});
