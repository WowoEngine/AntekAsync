const EventEmitter = require('events');
const Logger = require('../services/Logger');

class BrokerModule extends EventEmitter {
    constructor() {
        super();
        this.subscribers = new Map(); // topic -> Set of callbacks
        Logger.info('BrokerModule', 'Broker initialized');
    }

    /**
     * Subscribe to a topic
     * @param {string} topic 
     * @param {function} callback 
     */
    subscribe(topic, callback) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        this.subscribers.get(topic).add(callback);
        Logger.debug('BrokerModule', `New subscription for topic: ${topic}`);
    }

    /**
     * Unsubscribe from a topic
     * @param {string} topic 
     * @param {function} callback 
     */
    unsubscribe(topic, callback) {
        if (this.subscribers.has(topic)) {
            this.subscribers.get(topic).delete(callback);
            if (this.subscribers.get(topic).size === 0) {
                this.subscribers.delete(topic);
            }
        }
    }

    /**
     * Publish a message to a topic
     * @param {string} topic 
     * @param {any} message 
     * @param {string} source 
     */
    publish(topic, message, source) {
        Logger.info('BrokerModule', `Message on [${topic}] from [${source}]`, message);

        // Notify direct subscribers
        if (this.subscribers.has(topic)) {
            this.subscribers.get(topic).forEach(callback => {
                try {
                    callback(message, source);
                } catch (e) {
                    Logger.error('BrokerModule', 'Error in subscriber callback', e);
                }
            });
        }

        // Notify global listeners
        this.emit('publish', topic, message, source);
    }
}

// Singleton instance
module.exports = new BrokerModule();
