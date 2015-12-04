var assert 	= require('chai').assert,
	path 	= require('path');

describe('Config util library tests', function () {

	var testConfig = require('../test-helper'),
		configUtil;


	before(function () {
		configUtil = require(path.resolve(testConfig.project_root, 'util/config'));
	});

	it('should test config properties passed to config.init', function () {
		configUtil.init({
			a: 'A',
			b: 'B'
		});

		assert.equal(configUtil.get('a'), 'A');
		assert.equal(configUtil.get('b'), 'B');
	});

	it('should test config_dir, command_dir, space_replacement and error_command properties passed to config.init', function () {
		configUtil.init({
			COMMAND_DIR : path.resolve(testConfig.test_root, 'commands'),
			CONFIG_DIR 	: path.resolve(testConfig.test_root, 'config'),
			ERROR_COMMAND: 'test-error',
			SPACE_REPLACEMENT: '#SPACE#'
		});

		assert.equal(configUtil.get('COMMAND_DIR'), path.resolve(testConfig.test_root, 'commands'));
		assert.equal(configUtil.get('CONFIG_DIR'), path.resolve(testConfig.test_root, 'config'));
		assert.equal(configUtil.get('ERROR_COMMAND'), 'test-error');
		assert.equal(configUtil.get('SPACE_REPLACEMENT'), '#SPACE#');
	});

	it('should test default config_dir, command_dir, space_replacement and error_command, when not provided with config.init', function () {
		configUtil.init();

		assert.equal(configUtil.get('CONFIG_DIR'), path.resolve(testConfig.project_root, '../../config'));
		assert.equal(configUtil.get('COMMAND_DIR'), path.resolve(testConfig.project_root, '../../commands'));
		assert.equal(configUtil.get('ERROR_COMMAND'), 'app-error');
		assert.equal(configUtil.get('SPACE_REPLACEMENT'), '{SPACE}');
	});

});