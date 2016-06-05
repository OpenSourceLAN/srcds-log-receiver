### Srcds Log Receiver

A simple little app that will save the log files for any server that are 
sent to it. 

# Usage:

Start the app:
```
npm install
node app.js
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