'use strict';

var Slack 		= require('slack-client'),
	configUtil	= require('./util/config'),
	commandUtil	= require('./util/command'),
	dispatcher	= require('./dispatcher'),
	slackClient,
	options = {
		AUTO_RECONNECT 	: true,
		AUTO_MARK 		: true
	};

var _listen = function () {

	dispatcher.init(slackClient);

	slackClient.on('message', function (message) {
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

var getSlackClient = function () {
	return slackClient;
};

var init = function (opts, config) {
	
	if (!opts || !opts.SLACK_TOKEN) {
		throw new Error('SLACK_TOKEN not passed with opts in init');
	}

	options.SLACK_TOKEN 	= opts.SLACK_TOKEN;
	options.AUTO_RECONNECT  = opts.AUTO_RECONNECT || options.AUTO_RECONNECT;
	options.AUTO_MARK 		= opts.AUTO_MARK || options.AUTO_MARK;
	
	slackClient = new Slack(options.SLACK_TOKEN, options.AUTO_RECONNECT, options.AUTO_MARK);

	configUtil.init(config);
	
	_listen();
	_login();
};


exports.init 				= init;
exports.getCommandObjects 	= commandUtil.getCommandObjects;
exports.getResponseObjects 	= commandUtil.getResponseObjects;
exports.getSlackClient 		= getSlackClient;