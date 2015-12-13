# Turn Your Slack Channel into a Command-Line Terminal

## Why Slack?

Slack has a certain appeal and huge fan following in both developer and non-developer tech communities. It's slick user-interface(both web and mobile), concept of teams and channels to keep communication separate and relevant, tons of integrations for productivity(Dropbox, Box, Google Calendar, Hangouts etc) and things like giphy and [reminders](https://get.slack.help/hc/en-us/articles/201259356-Using-slash-commands), make it fun to use. Also, their APIs facilitate developers to extend the functionalities and build a customized experience for their team.
 
If you're thinking, no way that's unique to Slack: HipChat(or your favorite app here) has all that too! You might wanna take a look at this: [http://slackvshipchat.com/](http://slackvshipchat.com/)

## Goal of the Tutorial

This turorial aims to help developers get up and running with a simple node app that turns your slack channel into a custom command-line terminal. The app uses a helper module called [slack-terminalize](https://github.com/ggauravr/slack-terminalize)_(disclaimer: I developed it)_, that abstracts away initial processing of the messages. It uses the Slack's [Real-Time API Node client](https://github.com/slackhq/node-slack-client) and prepares a bot to listen and respond to your requests. 

Note that we won't be using [Slash Commands](https://api.slack.com/slash-commands) here, but instead interpret regular messages as commands. So if you were looking to learn about Slash Commands, this might not be the appropriate tutorial.

## Before Getting Started
My assumption is that you have a working knowledge of Javascript and NodeJS and that you're familiar with Slack jargon: teams, channels, [bots](https://api.slack.com/bot-users), [integrations](https://slack.com/integrations). Also, you'll need _node_ and _npm_ installed. You can follow [this](http://www.sitepoint.com/beginners-guide-node-package-manager/) wonderful SitePoint introduction on npm, to set up your dev environment.

## Motivation for _slack-terminalize_

  While there're many fancy [hubot](https://github.com/slackhq/hubot-slack) [scripts](https://hubot.github.com/docs/#scripts) that respond to natural language queries, a lot can be achieved with short commands and minimal keystrokes, as any linux fan would agree. Simple commands especially make sense in a mobile device, helping you type less, do more. And if you think about a command-line system, say your linux terminal, most of the times what the shell is doing(gross oversimplification, I know) is the grunt work of fetching, parsing, tokenizing and dispatching the commands. With that in mind, I felt the need of a module which could do exactly that, a shell for Slack channel if you will. With a parse-and-dispatch approach and a plugin-like architecture to add custom commands, _slack-terminalize_ abstracts things so you can focus more on defining the behavior of the app instead.

## Enough Talk, Let's Get Started
First, let's create a new bot user for your team, that can take your orders! Go to _https://\<your-team-name\>.slack.com/services/new/bot_ and choose a username for it, hit _Add Bot Integration_. 
![Add Bot User](bot_user_add.png "Add Bot User")

Copy the API token shown to you, as this is required for your bot to be able to interact with the channels. Configure other details of the bot, like it's profile image and real name and hit _Save Integration_.

![Save Bot User](bot_user_save.png "Save Bot User")

Then, clone and set up the sample app from [this repo](http://www.github.com)

### Project Structure Walkthrough

From the list of dependencies in _package.json_, the only required dependency is _slack-terminalize_, but since the sample app has an example on how to handle async commands, [request](https://www.npmjs.com/package/request) is used to make REST calls.

![Project Structure](project_structure.png "Project Strucrure")

**config/**

All the json files you might need for your app could go here. And I say could because it's fairly flexible and can be changed to work with a different directory, with the right configuration parameters(more on that, later) passed. This is just one of the many ways to structure your app, but I suggest, if you're new to Slack integrations, stick with this.
      
 _commands.json_
 
This is what makes adding custom commands a piece of cake. Each command is represented by a key-value pair: with key being the command(primary name only, not aliases) name itself, and value being an object with custom key-value pairs, that you would want to use for the command.

e.g: Here I use the following custom fields for each command:

- _alias_ - these are the aliases(or secondary names) for the command, which can be used in the slack channel to invoke this command as well. It's best to keep the smallest name as the primary name and more meaningful, longer names as aliases.

-  _description_ - a short readable description of what the command does

-  _help_ - a help message, to do something like *man \<command-name\>* or *help \<command-name\>*

-  _exclude_ - a flag to indicate if this command should be listed in the list of commands available to the user. May be you're still working on it, or it's for development purposes and not exposed.

-  _endpoint_ - REST endpoint that the command should talk to, in case, it depends on any external services to perform its task
      
 _alias_ is the only key from the above list that's looked up to map user typed commands to its primary name. Rest of them are optional and you're free to use any fields inside the command object, as you see fit for your app.

**commands/**

This is where the magic happens, place where you define command behavior. Each command specified in _config/commands.json_ should have its matching implementation here, with the filename matching the key(primary name) used in that json. That is how the dispatcher invokes the right handler. Yes, a bit opinionated I agree, but useful and cusomtizable(I'll talk about it later) nonetheless.

```json
{
	"help": {
		"alias": [ "halp" ],
		"endpoint": "#",
		"help": "help [command](optional)",
		"description": "To get help on all supported commands, or a specified command"
	},

	"gem": {
		"alias": [],
		"endpoint": "https://rubygems.org/api/v1/gems/{gem}.json",
		"help": "gem [gem-name]",
		"description": "Fetches details of the specified Ruby gem"
	},

	"app-error": {
		"exclude": true
	}
}
```

Notice that the key names in this file is same as the file names in commands/ directory.

### Code Walkthrough for the Sample App

Replace the token in index.js with the one for your bot. CONFIG\_DIR and COMMAND\_DIR are to tell slack-terminalize, where to look for config and command implementations respectively.

```javascript
var slackTerminal = require('slack-terminalize');

slackTerminal.init({
	SLACK_TOKEN: 'your-token-here'
}, {
	CONFIG_DIR: __dirname + '/config',
	COMMAND_DIR: __dirname + '/commands'
});
```

Install the dependencies and start the app

```bash
cd <sample-app-directory>
npm install
node .
```

Login to your Slack team, either on web or app. The bot is present in #general channel by default, but you can invite the bot to any of the channels, even private ones, with the Slash Command: /invite @\<your-bot-name\>. Soon as you type /invite @, Slack should automatically suggest you the user names. If you don't see your bot listed there, go back and check if you have integrated the bot correctly.

![Invite Bot](invite_bot.png "Invite Bot")

Type help in the channel and voila, the bot should respond to your request. Go ahead and play around with commands/help.js to change what you see in the response. Good way to get faimiliar with the sample-app. As you can see from the implementation, this command just reads the config/commands.json file to respond, so it's synchronous. Somtimes, you might need to do some async tasks, like quering a database or calling a rest endpoint, to fetch the response. Let's see how to go about that.

Take a peek at commands/gem.js and you'll see that it remembers the channel(through an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/)), the message was posted in and whenever it receives a response from the endpoint, posts back the response into the same channel!

```javascript
var request = require('request'),
	util 	= require('../util');

module.exports = function (param) {
	var	channel		= param.channel,
		endpoint	= param.commandConfig.endpoint.replace('{gem}', param.args[0]);

	(function(channel){
		
		request(endpoint, function (err, response, body) {
			var info = [];

			if (!err && response.statusCode === 200) {
				body = JSON.parse(body);

				info.push('Gem: ' + body.name + ' - ' + body.info);
				info.push('Authors: ' + body.authors);
				info.push('Project URI: ' + body.project_uri);
			}
			else {
				info = ['No such gem found!'];
			}

			util.postMessage(channel, info.join('\n\n'));
		});

	})(channel);

};
```

Try gem ab in your Slack channel and you should see something like this:

![Gem Response](gem_response.png "Gem Response")

Again, try playing around with the formatting of response message in commands/gem.js, to get the hang of it. So, now you have a bot listening on invited channels, responding to your requests. Let's see how you can add custom commands.

### Defining Custom Command Implementations

- Add your new command in config/commands.json: as mentioned before, key will the primary command name. Aliases for the command go in as an array of values in alias, as shown below.


```json
{
	"your-new-command": {
		"alias": [ "command-alias", "another-alias", "yet-another-alias" ],
		"help": "A short help message for the awesome new command",
		"description": "Brief description of what the command does"
	}
}
```

Currently, command names with space in them are not supported.

- Create a file with the same name as the primary name of your command above(so in this case, your-command-name.js) in commands/ directory. Assign module.exports to the command implementation function, as shown below.

```javascript
module.exports = function (param) {
	// param object contains the following keys:
	// 1. command - the primary command name
	// 2. args - an array of strings, which is user's message posted in the channel, separated by space
	// 3. user - Slack client User object
	// 4. channel - Slack client Channel object
	// 5. commandConfig - the json object for this command from config/commands.json
	
	// implement your logic here.. 
	// .. 
	
	// send back the response
	// more on this method here: https://api.slack.com/methods/chat.postMessage
	param.channel.postMessage({
		as_user: true,
		text: 'You entered `' + command + '` with arguments `' + param.args.join(" ") + '`\n';
	});
};
```

Refer [documentation](https://github.com/slackhq/node-slack-client) of node-slack-client, for more on User and Channel objects.

- Program your new command, restart the app and that's it! You should have your new command working.

### Customizing Behavior with Configurations

slack-terminalize module takes two parameters, an options object and a config object.

```javascript
var slackTerminal = require('slack-terminalize');

slackTerminal.init({
	SLACK_TOKEN: "xoxb-your-token-here", // the token you were shown when you added the bot
	AUTO_RECONNECT: true // or false, indicates if it should re-connect after error response from Slack
	AUTO_MARK: true // or false, indicates if the processed messages should be marked as read
}, {
	CONFIG_DIR: __dirname + '/config',
	COMMAND_DIR: __dirname + '/commands',
	ERROR_COMMAND: "app-error" // The filename it looks for in COMMAND_DIR, in case the user entered command is invalid
})
```

For more on the parameters, you can check the documentation [here](https://github.com/ggauravr/slack-terminalize).

## What Next?
- Go define some cool commands for your team: have fun and increase productivity.
- Fork the projects: [_slack-terminalize_]() and [its sample app](). Play around, contribute and help me improve it.
- Write to me about how you're using Slack for productivity. I'm all ears to learn the creative applications of the power bestowed upon developers by Slack APIs


## More Links and Resources
  - Slack Bot Users - https://api.slack.com/bot-users
  - Slack APIs - https://api.slack.com/
  - Hubot - https://hubot.github.com/
  - Hubot Slack - https://github.com/slackhq/hubot-slack
  - Node Slack Client - https://github.com/slackhq/node-slack-client
  - Introduction to WebSockets - http://blog.teamtreehouse.com/an-introduction-to-websockets
  - REST vs WebSockets - https://www.pubnub.com/blog/2015-01-05-websockets-vs-rest-api-understanding-the-difference/
  - How to create and publish your first Node module - https://medium.com/@jdaudier/how-to-create-and-publish-your-first-node-js-module-444e7585b738#.apmx8akep
  - Checklist for your new Open Source JS project - https://ericdouglas.github.io/2015/09/27/checklist-for-your-new-open-source-javascript-project/