'use strict';

var Slack 		= require('slack-client'),
	configUtil	= require('./util/config'),
	dispatcher	= require('./dispatcher'),
	slackClient,
	options = {
		AUTO_RECONNECT 	: true,
		AUTO_MARK 		: true
	};

var _listen = function () {

	dispatcher.init(slackClient);

	slackClient.on('message', function (message) {
		console.log('INFO: ' + message + ' received.');

		dispatcher.handle(message);
	});
};

var _login = function () {
	
	if (!slackClient) {
		console.log('ERR: slackClient client not initialized');
		return;
	}

	slackClient.login();
};

var init = function (opts, config) {
	
	if (!opts || !opts.SLACK_TOKEN) {
		console.log('ERR: opts or opts.SLACK_TOKEN parameter missing in init');
		return;
	}

	options.SLACK_TOKEN 	= opts.SLACK_TOKEN;
	options.AUTO_RECONNECT  = opts.AUTO_RECONNECT || options.AUTO_RECONNECT;
	options.AUTO_MARK 		= opts.AUTO_MARK || options.AUTO_MARK;
	
	slackClient = new Slack(options.SLACK_TOKEN, options.AUTO_RECONNECT, options.AUTO_MARK);

	configUtil.init(config);

	console.log('INFO: Directory name: ' + __dirname);

	_listen();

	_login();
};

exports.getSlackClient = function () {
	return slackClient;
};

exports.init 	= init;
exports.getCommandObjects = configUtil.getCommandObjects;
exports.getResponseObjects = configUtil.getResponseObjects;