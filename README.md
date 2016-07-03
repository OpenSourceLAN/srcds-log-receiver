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

var receiver = new logReceiver.LogListener();
receiver.on("data", function(data) {
	if (data.isValid) {
		console.log("Received at " + data.receivedAt.format() + " a log of type " + data.packetType);
	}
});
```

# Save to disk app usage:

For the log saver app, build with:

```
npm install 
node ./node_modules/typings/dist/bin.js install
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