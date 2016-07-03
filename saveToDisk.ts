
import * as LogReceiver from "./index";
import fs = require('fs');
import moment = require('moment');

var logPath = './logs/';

var receiver = new LogReceiver.LogReceiver({
	requirePassword: false,
	defaultPassword: "12345"
});

receiver.on("data", (m: LogReceiver.LogMessage) => {
	let path = getPath(m.receivedFrom);
	fs.appendFile(path, m.message, (e) => {
		if (e) { console.log (`Error writing to ${path}: ${e}`); }
	})
});

function getPath(rinfo: LogReceiver.ILogSourceDetails) {
	return `${logPath}${getFilename(rinfo)}`;
}

function getFilename(rinfo: LogReceiver.ILogSourceDetails) {
    var date = moment().format("YYYY-MM-DD");
    return `${date}-${rinfo.address}-${rinfo.port}.log`;
}