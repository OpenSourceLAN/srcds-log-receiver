import dgram = require("dgram");
import moment = require("moment");
import buffer = require("buffer");
import events = require("events");
import * as parser from "./PacketParser";

export type LogMessage = parser.LogMessage;
/**
 * Emits "data" event with the log message as the arg on valid packet
 * Emits "invalid" event when log message is bad for some reason
 */ 

export class LogReceiver extends events.EventEmitter {
	opts: ILogListenerOptions;
	socket: dgram.Socket;

	private parser: parser.LogMessageConstructor;

	constructor(opts?: ILogListenerOptions) {
		super();
		opts = opts || {};
		opts.address = opts.address || "0.0.0.0";
		opts.port = opts.port || 9871;
		opts.definedSources = opts.definedSources || [];
		opts.requirePassword = opts.requirePassword || false;

		this.opts = opts;
		this.parser = new parser.LogMessageConstructor(opts);
		this.createSocket();
	}

	private createSocket() {
		this.socket = dgram.createSocket('udp4', this.handleMessage.bind(this));
		this.socket.bind(this.opts.port, this.opts.address);
	}

	private handleMessage(message:Buffer, senderInfo: dgram.RemoteInfo) {
		var logMessage = this.parser.GetLogMessage(message, senderInfo);
		if (logMessage.isValid) {
			this.emit("data", logMessage);
		} else {
			this.emit("invalid", logMessage);
		}
	}
}

// duplicated in packetParser.ts because lazy
let magicBytePassword = 0x53,
    magicByteNoPassword = 0x52;

export interface ILogListenerOptions {
	port?: number;
	address?: string;
	requirePassword?: boolean;
	defaultPassword?: string;
	definedSources?: ILogSourceDetails[];
}

export interface ILogSourceDetails {
	port?: number;
	address?: string;
	password?: string;
}

export enum LogType {
	NoPassword = magicByteNoPassword,
	Password = magicBytePassword
}
