var net = require('net');
var convert = require('xml-js');

var server = net.createServer();  
server.on('connection', handleConnection);

server.listen(9001, function() {  
  console.log('server listening to %j', server.address());
});

function handleConnection(conn) {
  let connected = true;  
  let remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);
  // send data every 5 seconds to emulate automation system
  let interval = setInterval(function() {
    console.log("Data sent.")
  	let data = "<nowplaying><sched_time>55533940</sched_time><air_time>55611000</air_time><stack_pos></stack_pos><title>Heathens</title><artist>twenty one pilots</artist><trivia></trivia><category>SONG</category><cart>B31C</cart><intro>1000</intro><end></end><station>97.1</station><duration>10000</duration><media_type>SONG</media_type><milliseconds_left></milliseconds_left><Album>Suicide Squad (soundtrack)</Album><Ending>S</Ending><Field2></Field2><ISRC>USAT21601930</ISRC><Label>FBR/RRP</Label><Tempo></Tempo><YearSG>2016</YearSG></nowplaying><nowplaying><sched_time>55533940</sched_time><air_time>55611000</air_time><stack_pos></stack_pos><title>Heathens</title><artist>twenty one pilots</artist><trivia></trivia><category>IM2</category><cart>B31C</cart><intro>1000</intro><end></end><station>97.1</station><duration>10000</duration><media_type>SONG</media_type><milliseconds_left></milliseconds_left><Album>Suicide Squad (soundtrack)</Album><Ending>S</Ending><Field2></Field2><ISRC>USAT21601930</ISRC><Label>FBR/RRP</Label><Tempo></Tempo><YearSG>2016</YearSG></nowplaying><nowplaying><sched_time>55533940</sched_time><air_time>55611000</air_time><stack_pos></stack_pos><title>Heathens</title><artist>twenty one pilots</artist><trivia></trivia><category>SONG</category><cart>B31C</cart><intro>1000</intro><end></end><station>97.1</station><duration>10000</duration><media_type>SONG</media_type><milliseconds_left></milliseconds_left><Album>Suicide Squad (soundtrack)</Album><Ending>S</Ending><Field2></Field2><ISRC>USAT21601930</ISRC><Label>FBR/RRP</Label><Tempo></Tempo><YearSG>2016</YearSG></nowplaying>";
    conn.write(data);
    if (connected == false) {
      clearInterval(interval);
    }
  }, 5000);

  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
    connected = false;
  }

  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
    conn.destroy();
  }
}