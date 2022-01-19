
const axios = require('axios');
const http = require('http');
const https = require('https');

const TRACE_REQUEST=true;

var token;

const client = axios.create({
  //60 sec timeout
  timeout: 60000,

  //keepAlive pools and reuses TCP connections, so it's faster
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  
  //follow up to 10 HTTP 3xx redirects
  maxRedirects: 10,
  
  //cap the maximum content length we'll accept to 50MBs, just in case
  maxContentLength: 50 * 1000 * 1000
});

client.defaults.headers.post['Content-Type'] = 'application/json';
client.defaults.headers.put['Content-Type'] = 'application/json';
client.defaults.headers.get['Content-Type'] = 'application/json';


async function get(url) {

	if (token != null) {
		client.defaults.headers.common['Authorization'] = token;
	}

	if (TRACE_REQUEST)
		console.log("GET " + url);

	const result = (await client.get(url)).data;
	return result;
}

async function post(url, data) {

	if (token != null) {
		client.defaults.headers.common['Authorization'] = token;
	}

	if (TRACE_REQUEST)
		console.log("POST " + url + "    [" + data + "]");

	const result = (await client.post(url, data)).data;

   if (result.data != null &&  result.data.token != null) 
		token = result.data.token;

	return result;
}

async function put(url, data) {

	if (token != null) {
		client.defaults.headers.common['Authorization'] = token;
	}

	if (TRACE_REQUEST)
		console.log("PUT " + url + "    [" + data + "]");

	const result = (await client.put(url, data)).data;
	return result;
}

async function _delete(url, data) {

	if (token != null) {
		client.defaults.headers.common['Authorization'] = token;
	}

	if (TRACE_REQUEST)
		console.log("DELETE " + url + "    [" + data + "]");

	const result = (await client.delete(url, data)).data;
	return result;
}


module.exports = {
	get,
	post,
	put,
	delete: _delete
}

