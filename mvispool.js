
const { init } = require('./apiserver.js');
const config = require('./config.js');
const http = require('./http.js');

var W3CWebSocket = require('websocket').w3cwebsocket;

function ping_timer_callback(client) {
    client.send('2');
    //console.log("PING");
}

function parseMessage(data) {

    // Skip all numberic until found char { or ] or end of string
    let txt = "";
    let code = "";
    let res;

    for (let i = 0; i < data.length; i++) {
        if (data[i] == '{' || data[i] == '[') {

            // Copy rest of string
            for (; i < data.length; i++) {
                txt += data[i];
            }

            break;
        }

        code += data[i];
    }

    if (txt.length > 0) {
        let jsdata = JSON.parse(txt);

        if (Array.isArray(jsdata)) {
            res = {code : code, name: jsdata[0], data : JSON.parse(jsdata[1])};
        } else {
            res = {code : code, name: null, data : jsdata};
        }
    } else {
        res = {code : code, name: null, data : null};
    }

    return res;
}


module.exports = {

    async init() {

        var client = new W3CWebSocket('wss://mvis.ca:4000/socket.io/?EIO=3&transport=websocket', 'echo-protocol');

        client.onerror = function() {
            console.log('Connection Error');
        };
        
        client.onopen = function() {
            console.log('WebSocket Client Connected');
            client.send('42["profileDataSubscribe","0x44859572b26ec5d1bd917c74d8a35825434a7e20"]');
            setInterval(ping_timer_callback, 20000, client);
        };
        
        client.onclose = function() {
            console.log('echo-protocol Client Closed');
        };
        
        client.onmessage = async function(e) {
            if (typeof e.data === 'string') {
                let res = parseMessage(e.data);
                //console.log(e.data);
                //console.log("Received code: " + res.code + "  name: " + res.name + "   data: " + res.data + "\n"); 

                if (res.name != null) {

                    if (res.name.localeCompare("minerData") == 0) {

                        let emoncmsData = {
                            hashRate : res.data.hashRate / 1000000000.0,
                            tokenBalance :res.data.tokenBalance / 100000000.0,
                            ethBalance :res.data.ethBalance
                            };

                        console.log(emoncmsData);

                        let url = config.emoncms.addr + "/emoncms/input/post?node=" + config.emoncms.node + "&apikey=" + config.emoncms.apikey + "&json=" + JSON.stringify(emoncmsData);
                        try {
                            await http.get(url)
                        } catch(e) {
                            console.error(e);
                        }
                    }
                }
            }
        };

    },

    async get_effective_fee() {
    
        const res = await http.get("https://" + config.mvispool.addr + "/api/effectivefee");
        return parseInt(res, 10);
    }

}
