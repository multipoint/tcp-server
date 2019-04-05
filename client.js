/*
To run this script, open a command window, 
type node C:\Quu2Go\client.js
and hit Enter
*/
const net = require('net');
const convert = require('xml2js');
const request = require('request');
const argv = require('minimist')(process.argv.slice(2));

// config vars for automation system TCP connection
// wide orbit 
const port = argv.port || 5010,
    	ip = argv.ip || "172.25.3.85";

// config vars for streaming audio device connection
const streamingPort = argv.hostport || 6999,
      streamingIp = argv.hostip || "127.0.0.1";

const cutoffDurationInMs = 14000,
	    delayDurationInMs = 14000,
  	  maxEventsToSendOut = 3;

let futureEvents = true;
let dropCategoriesArr = [];
let sendArr = [];

//Create initial client for connecting to automation server and listening for XML event batches.
const automationClient = new net.Socket();

automationClient.connect(port, ip, function() {
    console.log('Connected to automation server.');
});

/*
This program runs for a particular station.
Start a server that automation system will connect to and post batches of events.
On getting an event batch, it would process and write out data(events) to any client that connects to it. The client is JG.
*/
const server = net.createServer(socket => {
    
    automationClient.on('data', data => {
        
        let response = handleConnection(data);

        if(response != null)
            socket.write(response);
        
        //socket.write(data);

    });

});

server.listen(streamingPort, streamingIp, () => {
  
    console.log('\nDO NOT CLOSE THIS WINDOW. OTHERWISE ADVERTISER EXPERIENCE WILL STOP.\n');
    console.log('ImageGate started.');

});


function handleConnection(data) {
    /*
    Takes XML data from automation system, converts to JSON to parse and manipulate it,
    then sends it out in XML again. Data can come in as single events or as a batch of events.
    In case of a single event, we send it out if its duration >= 14 secs.
    In case of a batch, we send out at least 1 and at most 3 events(1 current+2 future) whose duration >= 14 secs.
    The current event is the one with stack_pos = 0 and the subsequent next event's stack_pos is set to 1 even though it could be 1/2/3...
    If the 1st event's duration < 14 secs, we drop the entire batch.
    */
    //console.log("Data detected. Attempting to generate URL...");
    
    sendArr = [];
    
    try {
        //let stringifiedBuffer = `<nowplaying><sched_time>34615833</sched_time><air_time>34671000</air_time><stack_pos></stack_pos><title>Voice Track</title><artist>USER Account (PLE, etc)</artist><trivia>Inserted at 2019-3-29 09:13:58</trivia><category>VT4</category><cart>6T97</cart><intro>0</intro><end></end><station>KCYE</station><duration>11935</duration><media_type>UNSPECIFIED</media_type><milliseconds_left></milliseconds_left><Trivia></Trivia></nowplaying><nowplaying><sched_time>35026</sched_time><air_time></air_time><stack_pos>4</stack_pos><title>GOOD AS YOU</title><artist>KANE BROWN</artist><trivia>COLD</trivia><category>402</category><cart>0731</cart><intro>12</intro><end></end><station>KCYE</station><duration>190700</duration><media_type>SONG</media_type><milliseconds_left></milliseconds_left><Trivia></Trivia></nowplaying>`;
        let stringifiedBuffer = data.toString('utf8');

        //Positive lookahead split to preserver the delimiter
        //let eventArr = stringifiedBuffer.split(/(?=<nowplaying>)/); //split(/(?<=<\/nowplaying>)/);
        
        stringifiedBuffer = '<events>' + stringifiedBuffer + '</events>';

        //ITS THE NOWPLAYING ARRAY. RENAME
        let eventJsonArr = xmlToJson(stringifiedBuffer);
        
        if(eventJsonArr == null)
            return;

        if (!futureEvents) {

            let jsonObj = xmlToJson(eventArr[0]);

            //Get an array of the children of nowplaying tag
            let nowplayingObj = jsonObj.nowplaying;
            
            let stack_pos = nowplayingObj.stack_pos[0],
                category = nowplayingObj.category[0],
                duration = nowplayingObj.duration[0];

            //Send it 
            if (parseInt(stack_pos) >= 0 && parseInt(duration) >= cutoffDurationInMs && dropCategoriesArr.indexOf(category) == -1) {

                nowplaying.stack_pos[0] = '0';
                nowplaying.duration[0] = (parseInt(duration) + delayDurationInMs).toString();

                sendArr.push(jsonObj);
            }
        } 
        else {

            if (eventJsonArr.length == 1)
                return;

            //Loop over the array of JSON object and look for a valid current event. 
            //If found, add it to the sendArr array. Else do not proceed further.
            for (let nowplayingObj of eventJsonArr) {

                let stack_pos = nowplayingObj.stack_pos[0],
                    category = nowplayingObj.category[0],
                    duration = nowplayingObj.duration[0];
                    //console.log(nowplayingObj.stack_pos[0]);console.log(nowplayingObj['stack_pos'][0]);
                if (stack_pos == '0') {
                    if (parseInt(duration) < cutoffDurationInMs || dropCategoriesArr.indexOf(category) != -1)
                        return;
                    else {
                        nowplayingObj.duration[0] = (parseInt(duration) + delayDurationInMs).toString();
                        nowplayingObj.intro[0] = '0'; 

                        sendArr.push(nowplayingObj);
                        break;
                    }
                }
                                    
            }
            
            //If a current event was found
            if (sendArr.length == 1) {
                
                let future_pos = 1,
                    new_pos = 0;  //A count of future events to be sent out. At most 2 are allowed.

                //In this loop check the existence of future events(stack_pos > 0). 
                for (let nowplayingObj of eventJsonArr) {

                    let stack_pos = nowplayingObj.stack_pos[0],
                        category = nowplayingObj.category[0],
                        duration = nowplayingObj.duration[0];

                    //The below first condition makes sure that we move from stack_pos = 1 to the last stack_pos in ascending order. Otherwise we would have had to order the events array.
                    if (parseInt(stack_pos) == future_pos && parseInt(duration) >= cutoffDurationInMs && dropCategoriesArr.indexOf(category) == -1) {

                        nowplayingObj.stack_pos[0] = (++new_pos).toString();
                        nowplayingObj.duration[0] = (parseInt(duration) + delayDurationInMs).toString();
                        nowplayingObj.intro[0] = '0'; 

                        sendArr.push(nowplayingObj);
                        
                        if (sendArr.length == maxEventsToSendOut)
                            break;

                        future_pos++;
                    }
                }
            }
            
            return sendTcpEvent(sendArr);
        }

    } catch (error) {
        console.error(error);
    }

    return null;
}

//Helper that takes XML and converts to JSON. It will return null if the XML is malformed.
function xmlToJson(xml) {
    
    let jsonObj = null;

    try {
        
        convert.parseString(xml, (err, result) => {
            jsonObj = result.events.nowplaying;
        });

    } catch (error) {
        //console.error(error);
        console.log('\n\nerror in xml ' + xml);
    }

    return jsonObj;
};

function sendTcpEvent(sendArr) {

    console.log('\nSENDING OUT ' + sendArr.length);
    
    if (sendArr.length > 0) {

        let builder = new convert.Builder({headless: true, rootName: 'nowplaying', renderOpts: { 'pretty': true, 'indent': ' ', 'newline': '\n', allowEmpty: true }});
        
        let response = '';
        try{
            for (let json of sendArr) {
                
                let xml = builder.buildObject(json);
                response += xml;
                
            }
        }
        catch(error){
            console.error(error);
        }

        return response;

    }
    
    return null;

    /*
    //send data to another device via tcp
    const streamingClient = new net.Socket();
    try {
        console.log('connecting to streaming client');
        //streamingClient.connect(streamingPort, streamingIp, function() {
        streamingClient.connect(streamingPort, streamingIp, () => {
            streamingClient.write(xml);
            console.log('successfully wrote to the client');
            streamingClient.end();
        });
    }
    catch(error) {
        console.log(error);
    };*/
}