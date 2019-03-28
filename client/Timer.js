class Timer {
    constructor() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
    }

    update() {
        this.now = +new Date();
        this.delta = (this.now - this.last) / 1000.0;
        this.last = this.now;
    }
}
