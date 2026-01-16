const AntekGateway = require('../protocols/AntekGateway');
const MQTTGateway = require('../protocols/MQTTGateway');
const HTTPGateway = require('../protocols/HTTPGateway');
const Config = require('../services/Config');
const Logger = require('../services/Logger');

class GatewayManager {
    constructor() {
        this.gateways = [];
    }

    init() {
        const ports = Config.getAll();

        Logger.info('GatewayManager', 'Initializing gateways...');

        try {
            this.gateways.push(new AntekGateway(ports.tcp));
            this.gateways.push(new MQTTGateway(ports.mqtt));
            this.gateways.push(new HTTPGateway(ports.http));

            Logger.info('GatewayManager', 'Gateways initialized');
        } catch (err) {
            Logger.error('GatewayManager', 'Failed to initialize gateways', err);
        }
    }

    startAll() {
        Logger.info('GatewayManager', 'Starting all gateways...');
        this.gateways.forEach(gw => {
            try {
                gw.start();
            } catch (err) {
                Logger.error('GatewayManager', 'Failed to start gateway', err);
            }
        });
    }
}

module.exports = new GatewayManager();
