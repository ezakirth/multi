var canvas, ctx;

var clients = {};
var clientId = null;

var timer = new Timer();


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

    timer.update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in clients) {
        let client = clients[id];

        client.update();
        client.draw();
    }

}

