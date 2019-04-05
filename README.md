# WideOrbit TCP/IP Relay & Filter

The `client.js` script is designed to be started on a standalone machine on the LAN with an automation
system that's available on a local IP.  It will listen for events from the automation system, filter
them, and then pass them along on another TCP/IP server.

## Running

`npm install` will install all the dependencies for the project
`npm start` will run the project with the defaults

In order to connect to a specific automation system you'll use:

`npm start -- --ip=172.25.3.85 --port=5010`

By default it will listen on `localhost:6999` but it you need to specify the interface on which it will
be listening you can use:

`npm start -- --ip=172.25.3.85 --port=5010 --hostip=127.0.0.1 --hostport=8080`

