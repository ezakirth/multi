var canvas, ctx;

var clients = {};
var localClientId = null;

var time = new Timer();


window.onresize = function () {
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setup() {
    window.onresize();

    ctx = canvas.getContext('2d');

    draw();
}

function draw() {
    window.requestAnimationFrame(draw);

    time.update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let clientId in clients) {
        let client = clients[clientId];

        client.update();
        client.draw();
    }

}
