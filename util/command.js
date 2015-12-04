'use strict';

var path 		= require('path'),
	configUtil	= require('./config'),
	regexUtil	= require('./regex'),
	cmdPattern 	= '';

/**
 * Reads command.json from CONFIG_DIR and sets up a command pattern
 * for pattern matching message entered by a user.
 * Command pattern will be of the form: [command, alias, ...]
 * 
 * @return {none}
 */
var	setCommandPattern = function () {
	var commands = require(path.resolve(configUtil.get('CONFIG_DIR'), 'commands')),
		command,
		aliases;
	
	for(command in commands) {
		aliases = commands[command].alias || [];
		aliases.unshift(command);
		
		cmdPattern += '[' + aliases.join(',') + ']';
	}

};

exports.init = function () {
	setCommandPattern();
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
exports.parse = function (message) {
	var cleanMessage 	= message.text && message.text.trim().replace(regexUtil.regex.multi_spaces, configUtil.get('COMMAND_DELIM')),
		tokens			= cleanMessage.split(configUtil.get('COMMAND_DELIM')),
		userCommand		= tokens.length && tokens[0],
		command 		= getCommand(userCommand),
		args;

	// get rid of the command
	tokens.shift();

	args  = tokens.length ? 
	
				tokens
					
					// join by space to get back original text
					.join(configUtil.get('COMMAND_DELIM'))
					
					// replace spaces between quoted strings with space replacement pattern
					// this is being done to give back quoted arguments as a single entity
					.replace(regexUtil.regex.between_quotes, function (match, matchUnquoted) {
						matchUnquoted = matchUnquoted.replace(/\s/g, configUtil.get('SPACE_REPLACEMENT'));
						
						return match.replace(match, matchUnquoted);
					})

					// split them back by space
					// this time, quoted strings will not be split
					.split(configUtil.get('COMMAND_DELIM'))
				: 

				[];
	
	return {
		command: command,
		args: args
	};
};

/**
 * Fetches the primary command name from the command/alias specified by a user.
 * Command is only matched when the user command is found in the form: [user-command, or [...,user-command]
 * in the command pattern. This is done to avoid prefix/suffix matching.
 *
 * e.g: If the command pattern is: [help][lp, lpcommand] and if the user specified lp, then jsut matching for lp
 * matches 'help' too. So we wanna find the user command(lp) either after a ',' or a '[' character.
 * 
 * @param  {String} Command entered by the user, i.e the first word from the message entered
 * @return {String | undefined} Primary command, if the user command is matched to its primary, undefined otherwise
 */
var getCommand = function(userCommand) {
	var pattern = new RegExp('\\[(([^\\[]*[,])?' + userCommand + '[^\\]]*)\\]', 'i'),
		matches = cmdPattern.match(pattern) && cmdPattern.match(pattern)[0];

	if (!matches) {
		return configUtil.get('ERROR_COMMAND');
	}

	var	strippedMatch = ( matches.match(/\[(.*)\]/) && matches.match(/\[(.*)\]/)[1] ) || '',
		aliases = strippedMatch.split(',') || [];
	
	return aliases.length ? aliases[0] : configUtil.get('ERROR_COMMAND');

};

exports.getCommandObjects = function () {
	return JSON.parse(JSON.stringify(require(path.resolve(configUtil.get('CONFIG_DIR'), 'commands'))));
};

exports.getResponseObjects = function () {
	return JSON.parse(JSON.stringify(require(path.resolve(configUtil.get('CONFIG_DIR'), 'responses'))));
};