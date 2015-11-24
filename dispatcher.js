'use strict';

var configUtil	= require('./util/config'),
	commandUtil	= require('./util/command'),
	path		= require('path');

var handlers,
	commands,
	slackClient;

/**
 * @param  {object} - Slack client
 * @return {none}
 *
 * Reads commands.json from CONFIG_DIR and sets up handlers.
 * Handlers are expected to have the same name as the command, i.e. 
 * of the pattern {command-name}.js
 * 
 */
var init = function (client) {

	slackClient = client;

	handlers = {};
	
	commandUtil.init();

	commands = require(path.resolve(configUtil.get('CONFIG_DIR'), 'commands'));
	console.log('info: commands found: ', commands);

	Object.keys(commands).forEach(function (command) {
		handlers[command] = require(path.resolve(configUtil.get('COMMAND_DIR'), command));

		// console.log(command);
	});
};

var handle = function (message) {
	var messageDetails,
		command;

	messageDetails = commandUtil.parse(message);
	
	messageDetails.user = slackClient.getUserByID(message.user);
	messageDetails.channel = slackClient.getChannelGroupOrDMByID(message.channel);
		
	handlers[messageDetails.command](messageDetails);
	
	// console.log("Message Details", messageDetails);
	console.log("Command", messageDetails.command);

	console.log('info: dispatcher initiated');
};

exports.init = init;
exports.handle = handle;