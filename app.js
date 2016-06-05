"use strict";

/*

Usage:

mp_logdetail 3
sv_logsecret 12345
logaddress_add log.eleague.gg:9871
log on


*/

var fs = require('fs'),
    dgram = require('dgram'),
    moment = require('moment'),
    buffer = require('buffer');

var logPath = "./logs/",
    magicBytePassword = 0x53,
    magicByteNoPassword = 0x52,
    magicByteEndHeader = 0x4c,
    packetHeader = new Buffer([255,255,255,255]);

var password = new Buffer("12345");

class log {
    constructor(source) {
        this.source = source;
    }
}

// Make sure our log destination exists
fs.stat(logPath, (err, stat) => {
    if (err) {
        fs.mkdir(logPath, (err) => {
            if (err) {
                console.error("Couldn't create directory for logs and it doesn't exist already", err);
            }
        });
    }
});

var socket = dgram.createSocket('udp4');


socket.on('message', (msg, rinfo) => {
    
    if (msg.slice(0,4).compare(packetHeader) !== 0) {
        return console.error("Bad packet received");
    }
    msg = msg.slice(packetHeader.length);

    if ([/*magicByteNoPassword,*/magicBytePassword].indexOf(msg[0]) == -1) {
        return console.error("Received wrong packet type");
    }
    msg = msg.slice(1);

    if (checkPassword(msg, password, magicByteEndHeader) == false) {
        return console.error("Bad password");
    }
    msg = msg.slice(password.length+1);
    
    // Remove leading space 
    if (msg[0] == 0x20) {
        msg = msg.slice(1);
    }

    // Removes trailing null byte
    if (msg[msg.length-1] == 0x00) {
        msg = msg.slice(0,-1);
    }
    
    // Last char is a new line, which we want to log but don't want to display
    console.log(msg.slice(0,-1).toString());

    fs.appendFile(logPath + getFilename(rinfo), msg, (err) => {if (err) console.log(err)});
});

socket.on('listening', () => {
    console.log("Listening!");
});

socket.bind(9871);

function checkPassword(message, expect, trailByte) {
    if (message.length < expect.length + 1) {
        return false;
    }
    if (message.slice(0, expect.length).compare(expect) !== 0) {
        return false;
    }
    if (message[expect.length] != trailByte) {
        return false;
    }
    return true;
}

function getFilename(rinfo) {
    var date = moment().format("YYYY-MM-DD");
    return `${date}-${rinfo.address}-${rinfo.port}.log`;
}


// example thing - <Buffer ff ff ff ff 52 4c 20 30 36 2f 30 35 2f 32 30 31 36 20 2d 20 30 35 3a 31 34 3a 33 37 3a 20 73 65 72 76 65 72 5f 63 76 61 72 3a 20 22 6d 70 5f 72 6f 75 ... >