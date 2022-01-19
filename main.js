/**
 * \file main.js        \brief Main entry point
 */

const http = require('./http.js');
const config = require('./config.js');
const mvispool = require('./mvispool.js');
const minerator = require('./minerator.js');
const apiserver = require('./apiserver.js');

async function mvispool_status_timer_callback(arg) {
    var fee = await mvispool.get_effective_fee();
    console.log("Effective fee: " + fee);
}

async function minerator_status_timer_callback(arg) {
    var data = await minerator.get_status();

    let devices = [].concat(...Object.values(data.workers).map((x, workerIdx) => {
        x.devices.forEach(device => device.workerIdx = workerIdx);
        return x.devices;
    }));

    //console.log(devices);

    for(let dev of devices) {

        let hashrate = dev.cores[0].stats.minute.calculated / 60 / 1000;


        console.log("Temp: " + dev.bmc.adc.fpgaTemperature + "  hashrate: " + hashrate.toFixed(2));
    }

    console.log("");
}

async function main()
{
    await mvispool.init();

    //await apiserver.init();

    //setInterval(mvispool_status_timer_callback, config.mvispool.refresh_interval);
    //setInterval(minerator_status_timer_callback, config.minerator.refresh_interval);

    console.log("FPGA monitor is running ...");
}

// Entry
main();

