var net = require('net');
var convert = require('xml-js');

var server = net.createServer();  
server.on('connection', handleConnection);

server.listen(9000, function() {  
  console.log('server listening to %j', server.address());
});

function handleConnection(conn) {  
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);

  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
    try {
      let stringifiedBuffer = d.toString('utf8');
  
      function xmlToJson(xml) {
        let convertedXml = convert.xml2json(stringifiedBuffer);
        console.log(convertedXml);
        return JSON.parse(convertedXml);
      }
  
      let xmlObj = xmlToJson();
      let duration = xmlObj.elements[0].elements[11].elements[0].text,
          cart = xmlObj.elements[0].elements[7].elements[0].text,
          category = xmlObj.elements[0].elements[6].elements[0].text,
          cat = xmlObj.elements[0].elements[12].elements[0].text.toLowerCase();
      
      let url = `'http://www.97xonline.com?autoID=${cart}&autoCat=${category}&sec=CHANGEME&dur=${duration}&cat=${cat}`
      console.log(duration, cart, category, cat, url);
  
      console.log(`${xmlObj}`);
    }
    catch (error) {
      console.log(error);
    }
    // console.log('connection data from %s: %j', remoteAddress, d);
    
    // try {
    //   let options = {compact: true}
    //   console.log(JSON.parse(convertedXml))
    //   // console.log(`converted some XML to JSON: ${JSON.parse(convertedXml)}`)
    // } 
    // catch(error) {
    //   console.log(error);
    // }
      
    // //  
    // // conn.write(d);
  }

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
  }

  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  }
}