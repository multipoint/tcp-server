const net = require('net');
const convert = require('xml-js');
const request = require('request');

// **** FOR TESTING ENVIRONMENT ****

//for observation
let portPeekerIp = '75.151.123.46';
let portPeekerPort = 5000;

//testserver config variables
let testPort = 9001;
let testIp = 'localhost';

//outside network
let externalJumpUrl = 'http://75.151.123.42/live.json';

// ****** FOR LIVE ENVIRONMENT *****

// config vars for automation system TCP connection
// wide orbit 
let port = 11112;
let ip = "10.150.54.202";

// config vars for streaming audio device connection
let streamingPort = 21117,
		streamingIp = "10.150.55.108";

//inside network
let internalJumpUrl = 'http://10.150.55.212/live.json';

//create initial client for connecting to automation system and listening for XML
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
			console.log('stringifying things');
			let stringifiedBuffer = d.toString('utf8');
			
			// helper that takes XML and converts to JSON
      function xmlToJson(xml) {
				console.log('running xml to json');
        let convertedXml = convert.xml2json(stringifiedBuffer);
        return JSON.parse(convertedXml);
      };
  
      let xmlObj = xmlToJson();
      let duration = xmlObj.elements[0].elements[11].elements[0].text,
          cart = xmlObj.elements[0].elements[7].elements[0].text,
          category = xmlObj.elements[0].elements[6].elements[0].text,
					cat = xmlObj.elements[0].elements[12].elements[0].text.toLowerCase();

					var durationInSeconds = duration / 1000;
					console.log('duration is: ', durationInSeconds);

					if (durationInSeconds <= 10 && category == 'IM2') {
						console.log('duration is less than or equal to 10 seconds');
						console.log('requesting data');
						request(internalJumpUrl, function(error, response, body) {
							if (error) {
								console.error(error);
							}
							try {
								console.log('got the data,', typeof body);
								var parse = JSON.parse(body);
								console.log('parsed data successfully');
								var sec = parse.isaSEC;

								// url to be sent out to streaming audio device
								let url = `http://www.97xonline.com?autoID=${cart}&autoCat=${category}&sec=` + sec + `&dur=${duration}&cat=${cat}`
					
								console.log(`URL being sent to streaming audio device: ${url}`);
								
								// send data to another device via tcp
								const streamingClient = new net.Socket();
								try {
									console.log('connecting to streaming client');
									streamingClient.connect(streamingPort, streamingIp, function() {
										// streamingClient.connect(portPeekerPort, portPeekerIp, function() {
										console.log("Attemping to send URL to streaming device..."); 
										streamingClient.write(url);
										console.log('successfully wrote to the client');
										streamingClient.destroy();
									});
								}
								catch(error) {
									console.log(error);
								};
							} catch(e) {
								console.error(e);
							}
							
						});
					} else {
						console.log('duration is greater than 10 seconds');
					}
			
    }
		catch(error) {
      console.log(error);
    }
	}
}