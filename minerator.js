

const config = require('./config.js');
const http = require('./http.js');

module.exports = {

    async get_status() {
        const res = await http.get("http://" + config.minerator.addr + "/api/status");
        return res;
    }

}