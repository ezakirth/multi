var keyboard = {};

function keyUpdate(e) {
    keyboard.active = (e.type == "keydown");
    keyboard[e.key] = keyboard.active;
}

window.addEventListener('keydown', keyUpdate);
window.addEventListener('keyup', keyUpdate);


pendingMovement = [];
