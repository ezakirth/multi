class Client {
    constructor(clientId, position) {

        this.position = new Vector(position.x, position.y);
        this.direction = new Vector(1, 0);
        this.speed = 150;

        this.networkData = {
            clientId: clientId,
            lastPosition: { x: this.position.x, y: this.position.y, dx: this.direction.x, dy: this.direction.y },
            sequence: 0,
            positionBuffer: [],
            pendingMovement: []

        }

    }


    update() {
        // if the client is the client, update position based on input
        if (this.networkData.clientId == localClientId) {
            this.applyInputs();
        }
        // if the client is not the client (coming from network), interpolate its positions
        else {
            this.interpolatePositions();
        }
    }

    applyInputs() {
        this.direction = Vector.subtract(this.position, mouse.position).normalize();
        this.dirSide = Vector.rotate(this.direction, Math.PI / 2);


        if (keyboard.ArrowUp) {
            this.position.subtract(this.direction.multiply(time.delta * this.speed));
        }
        if (keyboard.ArrowDown) {
            this.position.add(this.direction.multiply(time.delta * this.speed));
        }
        if (keyboard.ArrowLeft) {
            this.position.add(this.dirSide.multiply(time.delta * this.speed));
        }
        if (keyboard.ArrowRight) {
            this.position.subtract(this.dirSide.multiply(time.delta * this.speed));
        }
    }

    interpolatePositions() {
        // Find the two authoritative positions surrounding the rendering timestamp.
        var buffer = this.networkData.positionBuffer;

        // Drop positions older than 100ms.
        while (buffer.length >= 2 && buffer[1].timestamp <= time.networkData.renderTimestamp) {
            buffer.shift();
        }

        // Interpolate between the two surrounding authoritative positions.
        // startpoint is older than 100ms, endpoint is less than 100ms ago
        if (buffer.length >= 2 && buffer[0].timestamp <= time.networkData.renderTimestamp && buffer[1].timestamp >= time.networkData.renderTimestamp) {
            var x0 = buffer[0].position.x;
            var y0 = buffer[0].position.y;
            var dx0 = buffer[0].direction.x;
            var dy0 = buffer[0].direction.y;
            var t0 = buffer[0].timestamp;

            var x1 = buffer[1].position.x;
            var y1 = buffer[1].position.y;
            var dx1 = buffer[1].direction.x;
            var dy1 = buffer[1].direction.y;
            var t1 = buffer[1].timestamp;

            this.position.x = x0 + (x1 - x0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.position.y = y0 + (y1 - y0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.direction.x = dx0 + (dx1 - dx0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.direction.y = dy0 + (dy1 - dy0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
        }
    }




    draw() {
        let ang = Math.atan2(this.direction.y, this.direction.x);
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(ang);
        ctx.fillRect(-16, -16, 32, 32);
        ctx.restore();
    }

}
