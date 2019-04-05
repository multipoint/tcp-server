var net = require('net');
var convert = require('xml-js');

let multieventData = "<nowplaying><sched_time>33903</sched_time><air_time></air_time><stack_pos>0</stack_pos><title>100 MIN MX RUN</title><artist>IN OR OUT SWP 5</artist><trivia></trivia><category>ID2</category><cart>5068</cart><intro>0</intro><end></end><station>100.7</station><duration>6700</duration><media_type>UNSPECIFIED</media_type><milliseconds_left></milliseconds_left><ISRC></ISRC><NOINTERNET></NOINTERNET></nowplaying><nowplaying><sched_time>33909</sched_time><air_time></air_time><stack_pos>1</stack_pos><title>Take It From Me</title><artist>Jordan Davis</artist><trivia>Outro: Cold</trivia><category>MU2</category><cart>2652</cart><intro>9</intro><end></end><station>100.7</station><duration>164773</duration><media_type>SONG</media_type><milliseconds_left></milliseconds_left><ISRC></ISRC><NOINTERNET></NOINTERNET></nowplaying><nowplaying><sched_time>34074</sched_time><air_time></air_time><stack_pos>2</stack_pos><title>NEW WOLF JINGLE 18 RAPID FIRE</title><artist></artist><trivia></trivia><category>ID2</category><cart>8082</cart><intro>0</intro><end></end><station>100.7</station><duration>3720</duration><media_type>UNSPECIFIED</media_type><milliseconds_left></milliseconds_left><ISRC></ISRC><NOINTERNET></NOINTERNET></nowplaying><nowplaying><sched_time>34078</sched_time><air_time></air_time><stack_pos>3</stack_pos><title>IF I DIE YOUNG</title><artist>THE BAND PERRY</artist><trivia>ICE COLD</trivia><category>MU2</category><cart>0619</cart><intro>0</intro><end></end><station>100.7</station><duration>218400</duration><media_type>SONG</media_type><milliseconds_left></milliseconds_left><ISRC></ISRC><NOINTERNET></NOINTERNET></nowplaying><nowplaying><sched_time>34296</sched_time><air_time></air_time><stack_pos>4</stack_pos><title>100 minute / most music</title><artist></artist><trivia></trivia><category>ID2</category><cart>5116</cart><intro>0</intro><end></end><station>100.7</station><duration>4827</duration><media_type>UNSPECIFIED</media_type><milliseconds_left></milliseconds_left><ISRC></ISRC><NOINTERNET></NOINTERNET></nowplaying>";

var server = net.createServer();
server.on('connection', handleConnection);

server.listen(9090, function() {
  console.log('server listening to %j', server.address());
});

function handleConnection(conn) {
  let connected = true;
  let remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);
  // send data every 5 seconds to emulate automation system
  let interval = setInterval(function() {
    console.log("Data sent.")
  	let data = "<nowplaying><sched_time>55533940</sched_time><air_time>55611000</air_time><stack_pos></stack_pos><title>Heathens</title><artist>twenty one pilots</artist><trivia></trivia><category>SONG</category><cart>B31C</cart><intro>1000</intro><end></end><station>97.1</station><duration>10000</duration><media_type>SONG</media_type><milliseconds_left></milliseconds_left><Album>Suicide Squad (soundtrack)</Album><Ending>S</Ending><Field2></Field2><ISRC>USAT21601930</ISRC><Label>FBR/RRP</Label><Tempo></Tempo><YearSG>2016</YearSG></nowplaying>";
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
