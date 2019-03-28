# WideOrbit TCP/IP Relay & Filter

The `client.js` script is designed to be started on a standalone machine on the LAN with an automation
system that's available on a local IP.  It will listen for events from the automation system, filter
them, and then pass them along on another TCP/IP server.

## Current Files

These files are the current used system:

## client.js

Connect to an automation system's TCP port, wait for events, filter them and forward them to a JumpGate.

## app.js

Start a TCP server on port 9000 and use it to relay the filtered events to a JumpGate.

## testserver.js

A server that emulates a WideOrbit automation system and will spit out XML every five seconds for testing purposes.


## Plans

We need to roll the WideOrbit listener and JumpGate client together and have the pipeline directly 
proxy the XML back to the JumpGate.
