const GatewayManager = require('./GatewayManager');
const Logger = require('../services/Logger');
const BrokerModule = require('../modules/BrokerModule');

class Server {
    constructor() {
        this.startTime = Date.now();
    }

    start() {
        console.clear();
        console.log('==========================================');
        console.log('       ANTEK ASYNC CORE (Pure JS)         ');
        console.log('==========================================');

        Logger.info('Server', 'Booting up...');

        // Initialize and Start Gateways
        GatewayManager.init();
        GatewayManager.startAll();

        // Hook into Broker logging
        BrokerModule.on('publish', (topic, msg, source) => {
            // Optional: Centralized traffic logging here if needed
        });

        Logger.info('Server', `Ready in ${Date.now() - this.startTime}ms`);
    }
}

module.exports = new Server();
