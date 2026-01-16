const Config = require('./Config');

class Auth {
    static isEnabled() {
        return Config.getAuth().enabled;
    }

    static validate(key) {
        const auth = Config.getAuth();
        if (!auth.enabled) return true;
        return key === auth.key;
    }
}

module.exports = Auth;
