class User {
    constructor(id, position) {
        this.id = id;

        this.position = new Vector(position.x, position.y);
        this.firstPos = new Vector(position.x, position.y);
        this.direction = new Vector(1, 0);
        this.firstDir = new Vector(1, 0);
        this.lastPosition = { x: this.position.x, y: this.position.y, dx: this.direction.x, dy: this.direction.y };



        this.speed = 150;
        this.sequence = 0;
        this.positionBuffer = [];
        this.pendingMovement = [];
    }

    update() {

        this.direction = Vector.subtract(this.position, mouse.position).normalize();
        this.dirSide = Vector.rotate(this.direction, Math.PI / 2);


        if (keyboard.ArrowUp) {
            this.position.subtract(this.direction.multiply(timer.delta * this.speed));
        }
        if (keyboard.ArrowDown) {
            this.position.add(this.direction.multiply(timer.delta * this.speed));
        }
        if (keyboard.ArrowLeft) {
            this.position.add(this.dirSide.multiply(timer.delta * this.speed));
        }
        if (keyboard.ArrowRight) {
            this.position.subtract(this.dirSide.multiply(timer.delta * this.speed));
        }

    }


}
