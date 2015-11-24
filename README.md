Module to help build a custom command-line vocabulary for your bot


[![Build Status](https://travis-ci.org/ggauravr/slack-terminalize.svg?branch=develop)](https://travis-ci.org/ggauravr/slack-terminalize)

[![Coverage Status](https://coveralls.io/repos/ggauravr/slack-terminalize/badge.svg?branch=develop&service=github)](https://coveralls.io/github/ggauravr/slack-terminalize?branch=develop)
=======
Helps build a command-line system in Slack, to create a custom command-line vocabulary for your bot

## Workflow
- require this module as a dependency in your app main js file
- call init function of the module, with options for slack and config
- dispatcher handles the parsing of the message and gives your app back the following components:
	- user
	- channel
	- alias(specified by the user)
	- command, the alias maps to, from commands.json
	- arguments array(split using the delimiter configured)
	- command object for the command
	- responses object for the command

## Tests
- index.js
	- init()
		- without Slack token, slack client is null
		- with slack token, auto_reconnect and auto_mark are true, slack client is not null
- dispatcher.js
	- 
- util/command.js
- util/config.js
