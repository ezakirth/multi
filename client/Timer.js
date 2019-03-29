class Timer {
    constructor() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
        this.renderTimestamp = 0;

        this.serverDelay = 100;
        this.serverUpdateTimeStamps = [];
    }

    update() {
        this.now = +new Date();
        this.renderTimestamp = this.now - this.serverDelay;
        this.delta = (this.now - this.last) / 1000.0;
        this.last = this.now;

        this.lastServerUpdate += this.delta;
    }

    setServerDelay(timestamp) {
        this.serverUpdateTimeStamps.push(timestamp);
        if (this.serverUpdateTimeStamps.length > 2) this.serverUpdateTimeStamps.shift();
        this.serverUpdateDelay = this.serverUpdateTimeStamps[0] - this.serverUpdateTimeStamps[1];
    }
}
