
const net = require('net');
const config = require('./config.js');
const http = require('./http.js');
const minerator = require('./minerator.js');

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new net.Server();

module.exports = {

    async init() {

        // The server listens to a socket for a client to make a connection request.
        // Think of a socket as an end point.
        server.listen(config.apiserver.port, "0.0.0.0", function() {
            console.log("Server listening on port: " + config.apiserver.port);
        });

        // When a client requests a connection with the server, the server creates a new
        // socket dedicated to that client.
        server.on('connection', function(socket) {
            console.log('A new connection has been established.');

            // Now that a TCP connection has been established, the server can send data to
            // the client by writing to its socket.
            //socket.write('Hello, client.');

            // The server can also receive data from the client by reading from its socket.
            socket.on('data', async function(chunk) {

                try {

                    //console.log(chunk.toString());

                    if (chunk.toString().includes("GET / HTTP/1.1")) {

                        const result = await http.get("http://" + config.minerator.addr);
                        socket.write(result);

                    } else {

                        var request = JSON.parse(chunk);
                        console.log(request);

                        if (request.method == "miner_getstat1") {

                            let response = { result : [
                                    "9.3 - ETH",                            // miner version.
                                    "0",                                    // uptime
                                    "0;0;0",                                // total ETH hashrate in MH/s, number of ETH shares, number of ETH rejected shares.
                                    "",                                     // detailed ETH hashrate for all GPUs. (30502;30457)
                                    "10;2;3",                               // total DCR hashrate in MH/s, number of DCR shares, number of DCR rejected shares.
                                    "10;2;3",                                // detailed DCR hashrate for all GPUs.
                                    "",                                     // Temperature and Fan speed(%) pairs for all GPUs. (53;71;57;67)
                                    "Bad/Total: ",                   // current mining pool. For dual mode, there will be two pools here.
                                    "0;0;0;0"                               // number of ETH invalid shares, number of ETH pool switches, number of DCR invalid shares, number of DCR pool switches.
                                ]};

                            // Get minerator status
                            const data = await minerator.get_status();

                            let devices = [].concat(...Object.values(data.workers).map((x, workerIdx) => {
                                x.devices.forEach(device => device.workerIdx = workerIdx);
                                return x.devices;
                            }));
                        
                            var total_hashrate = 0;

                            for(let dev of devices) {
                                if (response.result[3].length != 0)
                                    response.result[3] += ";";

                                let hashrate = (dev.cores[0].stats.minute.valid / 60) * 1000;
                                total_hashrate += hashrate;

                                response.result[3] += hashrate.toFixed(0);
                            }

                            for(let dev of devices) {
                                if (response.result[6].length != 0)
                                    response.result[6] += ";";

                                response.result[6] += dev.bmc.adc.fpgaTemperature + ";";
                                response.result[6] += 100;

                                response.result[7] += dev.cores[0].clock.badNonces.toFixed(0) + "/" +  dev.cores[0].clock.totalNonces.toFixed(0) + "<--->";
                            }
    //                        inp.stats.total.endTime-inp.stats.total.startTime)/1000000000)

                            response.result[0] = "Minerator - " + data.minerator;
                            response.result[2] = total_hashrate.toFixed(2) + ";0;0";  

                            console.log(JSON.stringify(response) + "\n");
                            socket.write(JSON.stringify(response) + "\n");
                        }
                    }

                } catch(e) {
                    console.error(e);
                }
            });

            // When the client requests to end the TCP connection with the server, the server
            // ends the connection.
            socket.on('end', function() {
                console.log('Closing connection with the client');
            });

            // Don't forget to catch error, for your own sake.
            socket.on('error', function(err) {
                console.log("Error: " + err);
            });
        });
    }

}





