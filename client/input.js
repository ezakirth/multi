var keyboard = {};
var mouse = { position: new Vector() };

function keyUpdate(e) {
    keyboard[e.key] = (e.type == "keydown");
}

window.addEventListener('keydown', keyUpdate);
window.addEventListener('keyup', keyUpdate);


function mouseUpdate(e) {
    mouse.position.x = e.clientX;
    mouse.position.y = e.clientY;
}
window.addEventListener('mousemove', mouseUpdate);
