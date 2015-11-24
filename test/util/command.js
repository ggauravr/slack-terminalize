var assert 	= require('chai').assert,
	path 	= require('path');

describe('Command util library tests', function () {

	var testConfig = require('../test-helper'),
		configUtil,
		commmandUtil;


	before(function () {
		
		configUtil = require(path.resolve(testConfig.project_root, 'util/config'));
		commandUtil = require(path.resolve(testConfig.project_root, 'util/command'));

		configUtil.init({
			CONFIG_DIR: path.resolve(testConfig.test_root, 'config')
		});

		commandUtil.init();

	});

	it('should test parse method with invalid command and undefined arguments', function () {
		var response = commandUtil.parse({
			text: 'invalidcmd'
		});

		assert.isUndefined(response.command);
		assert.isArray(response.args);
		assert.equal(0, response.args.length);
	});

	it('should test parse method with invalid command and valid arguments', function () {
		var response = commandUtil.parse({
			text: 'invalidcmd this that'
		});

		assert.isUndefined(response.command);
		assert.isArray(response.args);
		assert.equal(2, response.args.length);
		assert.equal(response.args[0], 'this');
		assert.equal(response.args[1], 'that');
	});

	it('should test parse method with invalid command and arguments with quoted spaced strings', function () {
		var response = commandUtil.parse({
			text: 'invalidcmd "this arg" and \'that arg\''
		});

		assert.isUndefined(response.command);
		assert.isArray(response.args);
		assert.equal(3, response.args.length);
		assert.equal(response.args[0], 'this{SPACE}arg');
		assert.equal(response.args[1], 'and');
		assert.equal(response.args[2], 'that{SPACE}arg');

	});

	it('should test parse method with valid command and undefined arguments', function () {
		var response = commandUtil.parse({
			text: 'cmd-a'
		});

		assert.equal('cmd-a', response.command);
		assert.isArray(response.args);
		assert.equal(0, response.args.length);
	});

	it('should test parse method with valid command alias and valid arguments', function () {
		var response = commandUtil.parse({
			text: 'commanda this that'
		});

		assert.equal('cmd-a', response.command);
		assert.isArray(response.args);
		assert.equal(2, response.args.length);
		assert.equal(response.args[0], 'this');
		assert.equal(response.args[1], 'that');
	});

	it('should test parse method with valid command and arguments with quoted spaced strings', function () {
		var response = commandUtil.parse({
			text: 'cmda "this arg" and \'that arg\''
		});

		assert.equal('cmd-a', response.command);
		assert.isArray(response.args);
		assert.equal(3, response.args.length);
		assert.equal(response.args[0], 'this{SPACE}arg');
		assert.equal(response.args[1], 'and');
		assert.equal(response.args[2], 'that{SPACE}arg');

	});

	it('should test parse method for removal of continuous multiple spaces', function () {
		var response = commandUtil.parse({
			text: '   cmda "this arg" and \'that    arg\'    '
		});

		assert.equal('cmd-a', response.command);
		assert.isArray(response.args);
		assert.equal(3, response.args.length);
		assert.equal(response.args[0], 'this{SPACE}arg');
		assert.equal(response.args[1], 'and');
		assert.equal(response.args[2], 'that{SPACE}arg');

	});

	it('should test parse method with custom space replacement pattern', function () {
		var response;

		configUtil.init({
			CONFIG_DIR: path.resolve(testConfig.test_root, 'config'),
			SPACE_REPLACEMENT: '#SPACE#'
		});

		response  = commandUtil.parse({
			text: '   cmda "this arg" and \'that    arg\'    '
		});

		assert.equal('cmd-a', response.command);
		assert.isArray(response.args);
		assert.equal(3, response.args.length);
		assert.equal(response.args[0], 'this#SPACE#arg');
		assert.equal(response.args[1], 'and');
		assert.equal(response.args[2], 'that#SPACE#arg');

	});

	it('should test fetching command objects from the json defined in config directory', function (){
		var response = commandUtil.getCommandObjects();

		assert.isDefined(response);
		assert.equal(1, Object.keys(response).length);
		assert.isDefined(response['cmd-a']);
		assert.equal(1, Object.keys(response['cmd-a']).length);
	});

	it('should test fetching response objects for defined commands from the json defined in config directory', function (){
		var response = commandUtil.getResponseObjects();

		assert.isDefined(response);
		assert.equal(1, Object.keys(response).length);
		assert.isDefined(response['cmd-a']);
		assert.equal(3, Object.keys(response['cmd-a']).length);
	});

});