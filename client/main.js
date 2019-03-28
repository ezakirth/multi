var canvas, ctx;

var users = {};
var userId = null;

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

    let user = users[userId];


    for (let id in users) {
        let user = users[id];
        ctx.fillRect(user.position.x, user.position.y, 32, 32);
    }

    if (user) {


        user.update();

    }


    interpolatePositions();

    window.requestAnimationFrame(update);
}




function interpolatePositions() {
    // Compute render timestamp.
    var renderTimestamp = new Date() - 100;

    for (let id in users) {
        var user = users[id];

        // No point in interpolating this client's user.
        if (user.id == userId) {
            continue;
        }

        // Find the two authoritative positions surrounding the rendering timestamp.
        var buffer = user.positionBuffer;

        // Drop positions older than 100ms.
        while (buffer.length >= 2 && buffer[1].timestamp <= renderTimestamp) {
            buffer.shift();
        }

        // Interpolate between the two surrounding authoritative positions.
        // startpoint is older than 100ms, endpoint is less than 100ms ago
        if (buffer.length >= 2 && buffer[0].timestamp <= renderTimestamp && buffer[1].timestamp >= renderTimestamp) {
            var x0 = buffer[0].position.x;
            var y0 = buffer[0].position.y;
            var r0 = buffer[0].position.r;
            var t0 = buffer[0].timestamp;

            var x1 = buffer[1].position.x;
            var y1 = buffer[1].position.y;
            var r1 = buffer[1].position.r;
            var t1 = buffer[1].timestamp;

            user.position.x = x0 + (x1 - x0) * (renderTimestamp - t0) / (t1 - t0);
            user.position.y = y0 + (y1 - y0) * (renderTimestamp - t0) / (t1 - t0);
            user.position.r = r0 + (r1 - r0) * (renderTimestamp - t0) / (t1 - t0);
        }
    }
}
