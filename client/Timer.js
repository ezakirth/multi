class Timer {
    constructor() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
        this.elapsed = 0;

        this.networkData = {
            renderTimestamp: 0,
            serverDelay: 100,
            serverUpdateTimeStamps: [],
            serverUpdateDelay: 0,
            lastServerUpdate: 0,
        }
    }

    update() {
        this.now = +new Date();
        this.delta = (this.now - this.last) / 1000.0;
        this.last = this.now;
        this.elapsed += this.delta;

        this.networkUpdate();
    }

    networkUpdate() {
        this.networkData.renderTimestamp = this.now + this.networkData.serverUpdateDelay;
        this.networkData.lastServerUpdate += this.delta;
    }
    setServerDelay(timestamp) {
        this.networkData.serverUpdateTimeStamps.push(timestamp);
        if (this.networkData.serverUpdateTimeStamps.length > 2) this.networkData.serverUpdateTimeStamps.shift();
        this.networkData.serverUpdateDelay = this.networkData.serverUpdateTimeStamps[0] - this.networkData.serverUpdateTimeStamps[1];
    }
}
