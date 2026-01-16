/**
 * Config Service
 * Centralized configuration loader.
 */
class Config {
    constructor() {
        this.ports = {
            tcp: process.env.ANTEK_TCP_PORT || 4000,
            http: process.env.ANTEK_HTTP_PORT || 3000,
            mqtt: process.env.ANTEK_MQTT_PORT || 1883
        };
        this.auth = {
            enabled: process.env.ANTEK_AUTH_ENABLED === 'true',
            key: process.env.ANTEK_AUTH_KEY || 'changeme'
        };
    }

    static get(key) {
        if (!this.instance) {
            this.instance = new Config();
        }
        return this.instance.ports[key]; // Simplified for now
    }

    static getAll() {
        if (!this.instance) {
            this.instance = new Config();
        }
        return this.instance.ports;
    }

    static getAuth() {
        if (!this.instance) {
            this.instance = new Config();
        }
        return this.instance.auth;
    }
}

module.exports = Config;
