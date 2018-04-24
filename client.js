const net = require('net');
const convert = require('xml-js');

// config vars for automation system TCP connection
let port = 9001;
let ip = "127.0.0.1";

// config vars for streaming audio device connection
let streamingPort = 9001,
		streamingIp = "127.0.0.1";

// create initial client for connecting to automation system and listening for XML
const client = new net.Socket();

client.connect(port, ip, function() {
	console.log('Automation client connected.')
	handleConnection(client);
});

function handleConnection(conn) {
	conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

	function onConnClose() {
		console.log('Connection closed.');
	};

	function onConnError(err) {
		console.log('Connection %s error: %s', err.message);
	};

	function onConnData(d) {
		// takes XML data from automation system's TCP connection and converts to JSON
		// then forms a URL string and sends it to the streaming audio device
		// looks something like: http://www.97xonline.com?autoID=0049&autoCat=IM2&sec=559&dur=10&cat=other
		console.log("Data detected. Attempting to generate URL...");

		try {
      let stringifiedBuffer = d.toString('utf8');
			
			// helper that takes XML and converts to JSON
      function xmlToJson(xml) {
        let convertedXml = convert.xml2json(stringifiedBuffer);
        return JSON.parse(convertedXml);
      };
  
      let xmlObj = xmlToJson();
      let duration = xmlObj.elements[0].elements[11].elements[0].text,
          cart = xmlObj.elements[0].elements[7].elements[0].text,
          category = xmlObj.elements[0].elements[6].elements[0].text,
          cat = xmlObj.elements[0].elements[12].elements[0].text.toLowerCase();
			
			// url to be sent out to streaming audio device
      let url = `http://www.97xonline.com?autoID=${cart}&autoCat=${category}&sec=CHANGEME&dur=${duration}&cat=${cat}`
			
			console.log(`URL being sent to streaming audio device: ${url}`);
			
			// send data to another device via tcp
			const streamingClient = new net.Socket();
			try {
				streamingClient.connect(streamingPort, streamingIp, function() {
					console.log("Attemping to send URL to streaming device..."); 
					streamingClient.write(url);	
					streamingClient.destroy();
				});
			} 
			catch(error) {
				console.log(error);
			}
    }
		catch(error) {
      console.log(error);
    }
	}
}

// client.on('data', function(data) {
// 	console.log('Received: ' + data);
// 	// client.destroy(); // kill client after server's response
// });

// client.on('close', function() {
// 	console.log('Connection closed');
// });