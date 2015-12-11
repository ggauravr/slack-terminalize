'use strict';

var configUtil	= require('./util/config'),
	commandUtil	= require('./util/command'),
	path		= require('path'),
	handlers,
	commands,
	slackClient;

/**
 * Reads commands.json from CONFIG_DIR and sets up handlers.
 * Handlers are expected to have the same name as the command, i.e.
 * of the pattern {command-name}.js
 * 
 * @param  { object } Slack client
 * @return { none }
 *
 */
var init = function (client) {

	slackClient = client;

	handlers = {};
	
	commandUtil.init();

	commands = require(path.resolve(configUtil.get('CONFIG_DIR'), 'commands'));

	Object.keys(commands).forEach(function (command) {
		handlers[command] = require(path.resolve(configUtil.get('COMMAND_DIR'), command));
	});
};

/**
 * Processes, using helpers, the user message posted and calls the appropriate command,
 * passing it an object with four parameters: the channel posted, the user posting,
 * the command entered by the user and the additional text as an array of tokens(args).
 * If no matching command is found, looks for and calls file named after the ERROR_COMMAND
 * config parameter set on initialization.
 * 
 * @param  { string } message posted by a user in Slack channel
 * @return { none }
 */
var handle = function (msg) {
	var data;

	// gets command and args parametrs
	data = commandUtil.parse(msg);
	
	data.user = slackClient.getUserByID(msg.user);
	data.channel = slackClient.getChannelGroupOrDMByID(msg.channel);
	data.commandConfig = commands[data.command];
	
	// respond only for non-bot user messages
	if (data.user && !data.user.is_bot) {
		if (!handlers[data.command]) {
			throw new Error('Command ' + data.command + ' not found in ' + configUtil.get('COMMAND_DIR') + ' directory');
		}

		handlers[data.command](data);
	}
};

exports.init 	= init;
exports.handle 	= handle;