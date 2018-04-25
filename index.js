'use strict';

var logger        = require('winston'),

  RtmClient       = require('@slack/client').RtmClient,
  WebClient       = require('@slack/client').WebClient,
  MemoryDataStore = require('@slack/client').MemoryDataStore,

  RTM_EVENTS      = require('@slack/client').RTM_EVENTS,
  CLIENT_EVENTS   = require('@slack/client').CLIENT_EVENTS,

  util = {
    config: require('./util/config'),
    command: require('./util/command')
  },

  dispatcher = require('./dispatcher'),
  rtmClient, webClient;

var _handleMessage = function (message) {
  dispatcher.handle(message);
}

var _startClient = function () {

  if (!rtmClient) {
    throw new Error('Slack RTM client not initialized');
  }

  logger.info('Starting RTM client.');

  dispatcher.init(rtmClient)

  rtmClient.on('connected', function () {
    logger.info('RTM client connected.');
    rtmClient.addListener('message', _handleMessage);
  });

  rtmClient.on('disconnected', function () {
    logger.info('RTM client disconnected.');
    rtmClient.removeListener('message', _handleMessage);
  });

  rtmClient.start();
};

var getRTMClient = function () {
  return rtmClient;
};

var getWebClient = function () {
  return webClient;
};

var init = function (token, opts, config) {

  if (!token) {
    throw new Error('slack token not passed with opts in init');
  }

  // set defaults if not provided
  opts.autoReconnect = opts.autoReconnect || true;
  opts.logLevel = opts.logLevel || 'error';
  opts.dataStore = new MemoryDataStore({});

  rtmClient = new RtmClient(token, opts);
  webClient = new WebClient(token, opts);

  util.config.init(config);

  _startClient();
};


exports.init            = init;
exports.getCommands     = util.command.getCommandObjects;
exports.getResponses    = util.command.getResponseObjects;
exports.getRTMClient    = getRTMClient;
exports.getWebClient    = getWebClient;
