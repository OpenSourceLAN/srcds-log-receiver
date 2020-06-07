import dgram = require('dgram');
import logs = require("./index");
import moment = require("moment");

let packetHeader = new Buffer([255,255,255,255]),
    magicBytePassword = 0x53,
    magicByteNoPassword = 0x52,
    magicStringEndHeader = "L "; // Dear Valve, what the hell is wrong with you?


function getPassword(message: Buffer): Buffer {
	var start = packetHeader.length + 1;
	var end = message.indexOf(magicStringEndHeader);
	if (end < 0) {
		return null;
	} else {
		return message.slice(start, end);
	}
}

function stringifyAddress(address: logs.ILogSourceDetails | dgram.RemoteInfo) {
	return `${address.address}:${address.port}`;
}

export class LogMessageConstructor {
	private opts: logs.ILogListenerOptions;
	private serverInfo: any = {};

	constructor( opts: logs.ILogListenerOptions) {
		this.opts = opts;
		this.buildServerInfo(opts);
	}

	private buildServerInfo(opts: logs.ILogListenerOptions) {
		opts.definedSources.forEach((v) => {
			this.serverInfo[stringifyAddress(v)] = v;
		});
	}

	public GetLogMessage(message: Buffer, senderInfo: dgram.RemoteInfo) {
		var logMessage: LogMessage = <LogMessage>{isValid: false};
		if (message.length < 16) {
			logMessage.invalidReason = InvalidReason.TooShort;
			return logMessage;
		}
		if (!this.validateHeader(message)) {
			logMessage.invalidReason = InvalidReason.BadHeader;
			return logMessage;
		}
		if (!this.validatePassword(logMessage, message, senderInfo)) {
			return logMessage;
		}

		if (!this.extractPayload(logMessage, message)) {
			return logMessage;
		}

		logMessage.isValid = true;
		logMessage.receivedAt = moment();
		logMessage.original = message;
		logMessage.receivedFrom = senderInfo;

		return logMessage;
	}

	private validateHeader(message:Buffer) {
		return message.slice(0,4).compare(packetHeader) === 0;
	}

	// TODO: unit test this because what is it even meant to be doing lol
	private validatePassword(logMessage: LogMessage, message: Buffer, senderInfo: dgram.RemoteInfo) {
		var packetType = message[4];

		if (packetType == magicBytePassword) {
			logMessage.packetType = logs.LogType.Password;
			var serverString = stringifyAddress(senderInfo);

			var server = <logs.ILogSourceDetails>this.serverInfo[serverString];
			var providedPass = getPassword(message);

			if (providedPass) {
				if (server) {
					if (server.password == providedPass.toString()) {
						logMessage.password =  server.password;
						return true;
					} else {
						logMessage.invalidReason = InvalidReason.WrongPassword;
						return false;
					}
				} else if (this.opts.defaultPassword == providedPass.toString()) {
					logMessage.password = providedPass.toString();
					return true;
				} else {
					logMessage.invalidReason = InvalidReason.WrongPassword;
					return false;
				}
			} else {
				logMessage.invalidReason = InvalidReason.NoPassword;
				return false;
			}
		} else if (packetType == magicByteNoPassword) {
			logMessage.packetType = logs.LogType.NoPassword;
			if (this.opts.requirePassword) return false;
			return true;
		} else {
			return false;
		}
	}

	private extractPayload(logMessage: LogMessage, message: Buffer) {
		var messageStart = message.indexOf(magicStringEndHeader);
		if (messageStart < 0) {
			logMessage.invalidReason = InvalidReason.NoPayload;
			return false;
		}
		messageStart += magicStringEndHeader.length;
		logMessage.message = message.slice(messageStart, message.length - 2).toString();
		return true;
	}
}

export interface LogMessage {
	isValid: boolean;
	packetType: logs.LogType;
	password: string;
	message: string;
	original: Buffer;
	invalidReason?: InvalidReason;
	receivedAt: moment.Moment;
	receivedFrom: dgram.RemoteInfo;
}

export enum InvalidReason {
	TooShort,
	BadHeader,
	NoType,
	NoPassword,
	WrongPassword,
	NoPayload
}
