class User {
    constructor(id, position) {
        this.id = id;
        this.position = position || { x: 0, y: 0, r: 0 };
        this.lastPosition = { x: this.position.x, y: this.position.y, r: this.position.r };
        this.speed = 50;
        this.sequence = 0;
        this.positionBuffer = [];
        this.pendingMovement = [];
    }

    update() {
        var movement = { x: 0, y: 0, r: 0 };

        // if (!(keyboard.ArrowUp || keyboard.ArrowDown || keyboard.ArrowLeft || keyboard.ArrowRight)) return;

        if (keyboard.a) {
            movement.r = timer.delta * this.speed;
        }
        if (keyboard.ArrowUp) {
            movement.y = -timer.delta * this.speed;
        }
        if (keyboard.ArrowDown) {
            movement.y = timer.delta * this.speed;
        }
        if (keyboard.ArrowLeft) {
            movement.x = -timer.delta * this.speed;
        }
        if (keyboard.ArrowRight) {
            movement.x = timer.delta * this.speed;
        }


        // apply movements for now
        this.position.x += movement.x;
        this.position.y += movement.y;
        this.position.r += movement.r;

        // send movement to server for validation
        //        let movementData = { movement: movement, sequence: ++this.sequence };
        //        socket.emit('update', movementData);

        // store movements for later reconciliation
        //        this.pendingMovement.push(movementData);
    }


}
