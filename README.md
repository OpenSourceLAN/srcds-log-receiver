### Srcds Log Receiver

A library to receive logs directly from a Source dedicated server (srcds) via 
its UDP log transport (`logaddress_add`). As these logs are sent live during
the game, this allows you to build interactive real time systems that react
to in-game events. 

Also included is a simple app that saves all received logs to disk. This means
that no matter what happens to your game server, the logs will always be saved.
See further below for usage information.

# Library usage

`npm install --save srcds-log-receiver`

Javascript example, but Typecript is also supported:
```
var logReceiver = require("srcds-log-receiver");
var options = {
	port: 9871  // this is the default
};

var receiver = new logReceiver.LogReceiver();
receiver.on("data", function(data) {
	if (data.isValid) {
		console.log("Received at " + data.receivedAt.format() + " a log of type " + data.packetType);
		console.log("The message is: " + data.message);
	}
});
receiver.on("invalid", function(invalidMessage) {
	console.log("Got some completely unparseable gargbase: " + invalidMessage);
})
```

The options object has the following structure:

```
interface ILogListenerOptions {
	port?: number; // Port number for deamon to listen on - default 9871
	address?: string; // IP address for deamon to listen on - default 0.0.0.0
	requirePassword?: boolean; // Reject messages from servers with no log password - default false
	defaultPassword?: string; // Catch-all password that any unspecified server may have
	definedSources?: ILogSourceDetails[]; // List of know servers/passwords - default empty
}

// Defines a server that you know will send log messages 
interface ILogSourceDetails {
	port?: number; // IP address of srcds server
	address?: string; // port of srcds server (same as game port)
	password?: string; // If blank/empty, no password. If set, require this password. 
}
```

# Log secrets

When the log payloads are sent, they include a `type` field in their header.
This will always be either `Log with password` or `Log without password`.

If the type is `without password`, then the log will be accepted if either the
server exists as a defined source with no password, *or*, the `requirePassword`
option is false. 

If the type is `with password`, then the log will *only* be accepted if the
server exists as a defined source with a matching password, *or* the provided
password matches the default password, irrespective of what `requirePassword`
is set to. 

The secret is defined in your srcds instance by setting the cvar `sv_logsecret`.
If it does not work, try a numeric password. 

# Save to disk app usage:

For the log saver app, build with:

```
npm install 
npm install -g typings
typings install
tsc
```

And run with:

```
node saveToDisk.js
```

On your  SRCDS server:
```
mp_logdetail 3
sv_logsecret 12345
logaddress_add ipaddress-or-hostname:9871
log on
```
And hey presto, you're receiving logs in the `./logs` directory!

If you are running Warmod, you can send warmod logs here as well - 

```
wm_stats_method 2 // To make sure logs are sent to both this app via UDP and stored locally 
wm_stats_trace 1 // If you want to record player locations in the logs too, set this
```

For example:

```
$ tail -n 5 logs/2016-06-05-10.0.0.100-27015.log
06/05/2016 - 06:39:06: "Norm<20><BOT><TERRORIST>" [619 -1349 -280] attacked "Keith<17><BOT><CT>" [420 -1444 -280] with "nova" (damage "16") (damage_armor "0") (health "6") (armor "58") (hitgroup "left leg")
06/05/2016 - 06:39:06: "Norm<20><BOT><TERRORIST>" [619 -1349 -280] attacked "Keith<17><BOT><CT>" [420 -1444 -280] with "nova" (damage "13") (damage_armor "6") (health "0") (armor "51") (hitgroup "stomach")
06/05/2016 - 06:39:06: "Norm<20><BOT><TERRORIST>" [619 -1349 -280] killed "Keith<17><BOT><CT>" [420 -1444 -216] with "nova"
06/05/2016 - 06:39:06: "Norm<20><BOT><TERRORIST>" [619 -1349 -280] attacked "Dean<14><BOT><CT>" [400 -1464 -280] with "nova" (damage "16") (damage_armor "0") (health "84") (armor "100") (hitgroup "left leg")
06/05/2016 - 06:39:07: "Norm<20><BOT><TERRORIST>" [619 -1349 -280] attacked "Dean<14><BOT><CT>" [399 -1445 -280] with "nova" (damage "13") (damage_armor "6") (health "71") (armor "93") (hitgroup "stomach")
```

# TODO

* Add tests
* Tidy up project
* Add way to add/remove defined sources after instantiation