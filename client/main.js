var canvas, ctx;

var players = {};
var playerId = null;

var timer = new Timer();

window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setup() {
    canvas = document.getElementById('canvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx = canvas.getContext('2d');

    update();
}

function update() {
    timer.update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let player = players[playerId];


    for (let id in players) {
        let player = players[id];
        ctx.fillRect(player.position.x, player.position.y, 32, 32);
    }

    if (player) {


        player.update();

    }


    interpolateplayers();

    window.requestAnimationFrame(update);
}




function interpolateplayers() {
    // Compute render timestamp.
    var renderTimestamp = new Date() - 100;

    for (let id in players) {
        var player = players[id];

        // No point in interpolating this client's player.
        if (player.id == playerId) {
            continue;
        }

        // Find the two authoritative positions surrounding the rendering timestamp.
        var buffer = player.positionBuffer;

        // Drop positions older than 100ms.
        while (buffer.length >= 2 && buffer[1].timestamp <= renderTimestamp) {
            buffer.shift();
        }

        // Interpolate between the two surrounding authoritative positions.
        // startpoint is older than 100ms, endpoint is less than 100ms ago
        if (buffer.length >= 2 && buffer[0].timestamp <= renderTimestamp && buffer[1].timestamp >= renderTimestamp) {
            var x0 = buffer[0].position.x;
            var y0 = buffer[0].position.y;
            var t0 = buffer[0].timestamp;

            var x1 = buffer[1].position.x;
            var y1 = buffer[1].position.y;
            var t1 = buffer[1].timestamp;

            player.position.x = x0 + (x1 - x0) * (renderTimestamp - t0) / (t1 - t0);
            player.position.y = y0 + (y1 - y0) * (renderTimestamp - t0) / (t1 - t0);
        }
    }
}
