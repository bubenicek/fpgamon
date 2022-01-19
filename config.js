/**
 * \file config.js      \title Configuration / constants
 */


module.exports = {

   minerator: {
	   addr: "miner3",
       refresh_interval: 1000,
       main_cfg_key: "24327239d256248dac5c78e9b802193d3fe82a69",
       backup_cfg_key: "95359d10e981ef7dad3abcf6c69da303967f1bfc"
   },

   mvispool: {
       enabled: true,
       addr: "mvis.ca",
       wsport: 4000,
       refresh_interval: 60000
   },

   apiserver: {
       port: 4444
   },

   emoncms: {
       addr: "http://192.168.8.4",
       apikey: "3719dc13f32c46e32a1d5f62273e3185",
       node : "mvispool"
   }

}

