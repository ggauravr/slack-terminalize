'use strict';

var path 		= require('path'),

	util = {
		config: require('./config'),
		regex: require('./regex')
	},

	cmdPattern 	= '';

/**
 * Reads command.json from CONFIG_DIR and sets up a command pattern
 * for pattern matching message entered by a user.
 * Command pattern will be of the form: [command, alias, ...]
 *
 * @return { none }
 */
var	_setCommandPattern = function () {
	var commands = require(path.resolve(util.config.get('CONFIG_DIR'), 'commands')),
		command,
		aliases;

	for(command in commands) {
		aliases = commands[command].alias || [];
		aliases.unshift(command);

		cmdPattern += '[' + aliases.join(',') + ']';
	}

};

/**
 * Fetches the primary command name from the command/alias specified by a user.
 * Command is only matched when the user command is found in the form: [user-command, or [...,user-command]
 * in the command pattern. This is done to avoid prefix/suffix matching.
 *
 * e.g: If the command pattern is: [help][lp, lpcommand] and if the user specified lp, then just matching for lp
 * matches 'help' too. So we wanna find the user command(lp) either after a ',' or a '[' character.
 *
 * @param  { string } Command entered by the user, i.e the first word from the message entered
 * @return { string | undefined } Primary command, if the user command is matched to its primary, undefined otherwise
 */
var _getCommand = function(userCommand) {
	if (!userCommand) {
		return util.config.get('ERROR_COMMAND');
	}
  	userCommand = userCommand.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	var pattern = new RegExp('\\[(([^\\[]*[,])?' + userCommand + ')[\\]|,]', 'i'),
		matches = cmdPattern.match(pattern);

	if (!matches) {
		return util.config.get('ERROR_COMMAND');
	}

	return matches[1].split(',')[0];
};

var init = function () {
	_setCommandPattern();
};

/**
 * Default delimiter used to tokenize message is space(' ') character. To handle quoted strings, which even with spaces,
 * should be considered as a single entity, spaces inside quoted strings are replaced by a space replacement pattern.
 * The default space replacement pattern is {SPACE}, i.e. a string in message like "Firstname Lastname", will be
 * given as Firstname{SPACE}Lastname. The app handling these tokens should replace this pattern back to space(' ')
 * character. Also, continuous multiple spaces in the message will be replaced by a single space character.
 *
 * @param  {String} - Text/message entered by a user in slack channel
 * @return {Object} - Object containing user, channel, command and arguments, all parsed from the user message
 */
var parse = function (message) {
	var cleanMessage 	= message.text && message.text.trim().replace(util.regex.regex.multi_spaces, util.config.get('COMMAND_DELIM')) || '',
		tokens			= cleanMessage.split(util.config.get('COMMAND_DELIM')),
		userCommand		= tokens.length && tokens[0],
		command 		= _getCommand(userCommand),
		args;

	// get rid of the command
	tokens.shift();

	args  = tokens.length ?

				tokens

					// join by space to get back original text
					.join(util.config.get('COMMAND_DELIM'))

					// replace spaces between quoted strings with space replacement pattern
					// this is being done to give back quoted arguments as a single entity
					.replace(util.regex.regex.between_quotes, function (match, matchUnquoted) {
						matchUnquoted = matchUnquoted.replace(/\s/g, util.config.get('SPACE_REPLACEMENT'));

						return match.replace(match, matchUnquoted);
					})

					// split them back by space
					// this time, quoted strings will not be split
					.split(util.config.get('COMMAND_DELIM'))
				:

				[];

	if (command === util.config.get('ERROR_COMMAND')) {
		args.unshift(userCommand);
	}

	return {
		command: command,
		args: args
	};
};

var getCommandObjects = function () {
	return JSON.parse(JSON.stringify(require(path.resolve(util.config.get('CONFIG_DIR'), 'commands'))));
};

var getResponseObjects = function () {
	return JSON.parse(JSON.stringify(require(path.resolve(util.config.get('CONFIG_DIR'), 'responses'))));
};

exports.init = init;
exports.parse = parse;
exports.getCommandObjects = getCommandObjects;
exports.getResponseObjects = getResponseObjects;
