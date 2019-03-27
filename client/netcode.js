socket.on('init', function (player) {
    playerId = player.id;
    players[playerId] = new Player(player.id, player.position);
});

socket.on('disconnected', function (id) {
    delete players[id];
});

socket.on('update', function (data) {
    for (let id in data) {
        let playerData = data[id];
        if (!players[id]) {
            players[id] = new Player(playerData.id, playerData.position);
        }

        let player = players[id];

        if (id == playerId) {
            // Received the authoritative position of this client's player.
            player.position = playerData.position;

            // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
            var j = 0;
            while (j < pendingMovement.length) {
                var movementData = pendingMovement[j];
                if (movementData.sequence <= playerData.sequence) {
                    // Already processed. Its effect is already taken into account into the world update
                    // we just got, so we can drop it.
                    pendingMovement.splice(j, 1);
                } else {
                    player.position.x += movementData.movement.x;
                    player.position.y += movementData.movement.y;
                    j++;
                }
            }

        } else {
            // Received the position of an player other than this client's.

            // Add it to the position buffer.
            player.positionBuffer.push({ timestamp: new Date(), position: playerData.position });
        }
    }

});
