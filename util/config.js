'use strict';

var path = require('path'),
	rootDirectory = path.resolve(__dirname, '../../..'),
	config = {};

/**
 * Initializes config on startup. Four important parameters it looks for:
 * 1. CONFIG_DIR: place to get commands.json and responses.json, i.e used to change the behavior of commands
 * 2. COMMAND_DIR: place to look for <cmd-name>.js files, for the command implementations
 * 3. SPACE_REPLACEMENT: used to replace space inside quoted strings, default '{SPACE}'
 * 4. COMMAND_DELIM: delimiter to split message into tokens(not configurable, uses space (' ') character)
 * 
 * Since this module is to be used by some parent module, usually this project will be found inside node_modules,
 * hence the default directory for CONFIG_DIR and COMMAND_DIR are ../../../<config|commands>, that's equaivalent to
 * <parent-project-root>/<config|commands>.
 *
 * 
 * @param  {Object} Configuration parameters
 * @return {none}
 */
var init = function (arg) {
	config = {};
	arg = arg || {};

	// copy arg to config
	Object.keys(arg).forEach(function(el) { config[el] = arg[el]; });

	config['CONFIG_DIR'] 		 	= config['CONFIG_DIR'] || path.resolve(rootDirectory, 'config');
	config['COMMAND_DIR'] 		 	= config['COMMAND_DIR'] || path.resolve(rootDirectory, 'commands');
	config['SPACE_REPLACEMENT'] 	= config['SPACE_REPLACEMENT'] || '{SPACE}';
	config['COMMAND_DELIM'] 		= ' ';

};

var get = function (property) {
	return (property && config[property]);
};

exports.init = init;
exports.get  = get;