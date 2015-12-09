## Turn Your Slack Channel into a Command-Line Terminal

#### What's so awesome about Slack?

Slack has a certain appeal and huge fan following in both developer and non-developer communities. It's slick user-interface(both web and mobile), concept of teams and channels to keep communication separate and relevant, tons of integrations for productivity(Dropbox, Box, Google Calendar, Hangouts etc) and things like giphy and reminders make it fun to use. Also, their APIs facilitate developers to extend the functionalities and build a customized experience for their team.
 
If you're thinking, no way that's unique to Slack: HipChat(or your favorite app here) has all that too! Hell, there's a website for that: [http://slackvshipchat.com/](http://slackvshipchat.com/)

#### Goal of the tutorial

This turorial aims to help developers get up and running with a simple node app that turns your slack channel into a custom command-line terminal. The app uses a helper module called [slack-terminalize](https://github.com/ggauravr/slack-terminalize)_(disclaimer: I developed it)_, that abstracts away initial processing of the messages. It uses the Slack's [Real-Time API Node client](https://github.com/slackhq/node-slack-client) and prepares a bot to listen and respond to your requests.

#### Before getting started
The tutorial assumes that you have a working knowledge of Javascript and NodeJS and that you're familiar with Slack jargon: teams, channels, [bots](https://api.slack.com/bot-users), [integrations](https://slack.com/integrations). Also, you'll need node and npm installed. You can follow [this](http://www.sitepoint.com/beginners-guide-node-package-manager/) wonderful SitePoint introduction on npm to set up your dev environment.

#### Motivation for _slack-terminalize_

  While there're many fancy [hubot](https://github.com/slackhq/hubot-slack) [scripts](https://hubot.github.com/docs/#scripts) that respond to natural language queries, a lot can be achieved with short commands and minimal keystrokes, as any linux fan would agree. Simple commands also prove especially useful in a mobile device, helping you type less, do more. And if you think about a command-line system, say your linux terminal, most of the times what the shell is doing(gross oversimplification, I know) is the grunt work of fetching, cleaning, parsing, tokenizing and dispatching the commands. With that in mind, I felt the need of a module which could take care of exactly that, a shell for Slack channel, if you will. With a parse-and-dispatch approach and a plugin-like architecture to add custom commands, _slack-terminalize_ abstracts things so you can focus more on defining the behavior of the app instead.
  
#### Slack Bots vs Slash Commands?
- Slash commands have ephemeral messages and auto-complete/suggest<br/>
  **Commands: 1, Bots: 0**

- You get more control with bots, since you can decide which channels the bot is in(even private channels). Also, you can send direct messages to it, just like a regular user.<br/>
  **Commands: 1, Bots: 1** 

- Slash commands use HTTP, where as bot integrations use WebSockets<br/>
  **Commands: 1, Bots: 2**
  
- Each new bot user integration [counts as a separate integration](https://api.slack.com/bot-users), so there's a limit to how many bots you can have in your team in the free tier of Slack<br/>
  **Commands: 2, Bots: 2**

- If the Slash command you want to define is already used by one of the third-party integrations you have made, you gotta compromise on the command name. Bots, on the other hand just read your commands like regular messages, so there's no conflict with other integrations. No fancy prefixes(like / for Slash Commands) for your messages.<br/>
  **Commands: 2, Bots: 3**
  
So, from my carefully chosen points and a biased opinion towards bots, clearly(surprise, surprise) bots win.

#### Enough talk, let's get started
  - First, let's create a new bot user for your team, that can take your orders! Go [here](https://<your-team-name>.slack.com/services/new/bot) and choose a name for it. Copy the API token shown to you, as this is required for your bot to be able to interact with channels. Configure other details of the bot, like it's profile image and real name(that's right, real name for a fake user) and hit _Save Integration_.

  - Next, clone and set up the sample app with from [this repo](http://www.github.com)

#### Project structure walkthrough

The only required dependency is _slack-terminalize_, but since the sample app has an example to show how to handle async commands, _request_ is used to make REST calls.

**config/**<br/>
As you can see config/ directory has two json files:
      
1. _commands.json_<br/>
	This is what makes adding custom commands a piece of cake. Each command is represented by a key-value pair, with key being the command(primary name only, not aliases) name itself, and value being an object with custom key-value pairs, that you would want to use for the command.<br/><br/>
      e.g: Here I use, the following custom fields for each command: 
      - _alias_ - these are the aliases(or secondary names) for the command, which can also be used in the slack channel as well
      - _description_ - a short readable description of what the command does
      - _help_ - a short help message, to do something like *man \<command-name\>* or *help \<command-name\>*
      - _exclude_ - a flag to indicate if this command should be listed in the list of commands available to the user
      - _endpoint_ - REST endpoint that the command should talk to, in case, it depends on any external services to perform its task
      
      _alias_ is the only key from the above list that's looked up inside *slack_terminalize*. Rest of them are optional and you're free to use any fields inside the command object, that makes sense for your app.

2. _responses.json_<br/>
Rather than embedding string messages in the command implementation itself([Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns), remember?), this json makes it easy to define the various cases your command could run into(like _success, error, insufficient arguments and so on_) and the corresponding response templates

**commands/**<br/>
This is where the magic happens, place where you define command behavior. Each command specified in _config/commands.json_ should have its matching implementation here, with the filename matching the key(primary name) used in that json. That is how the dispatcher invokes the right handler. Yes, a bit opinionated I agree, but useful and cusomtizable(I'll talk about it later) nonetheless.


#### Code walkthrough for the sample app
  - How to declare custom commands, defining their implementation
  - Implementing two simple commands: one that responds synchronously, and one that responds asynchronously(calls an external API, to fetch response)
  - Various configurations that can be passed to <my-module-name> to customize the bot behavior and project structure

#### What next?
- Go define some cool commands for your team: have fun and increase productivity. 
- Fork the projects: [_slack-terminalize_]() and [its sample app](). Play around, contribute and help me improve it.
- Write to me about how you're using Slack for productivity. I'm all ears to learn the creative applications of the power bestowed upon developers by Slack APIs


- Links/Resources
  - Slack Bot Users - https://api.slack.com/bot-users
  - Slack APIs - https://api.slack.com/
  - Hubot - https://hubot.github.com/
  - Hubot Slack - https://github.com/slackhq/hubot-slack
  - Node Slack Client - https://github.com/slackhq/node-slack-client
  - Introduction to WebSockets - http://blog.teamtreehouse.com/an-introduction-to-websockets
  - REST vs WebSockets - https://www.pubnub.com/blog/2015-01-05-websockets-vs-rest-api-understanding-the-difference/
  - How to create and publish your first Node module - https://medium.com/@jdaudier/how-to-create-and-publish-your-first-node-js-module-444e7585b738#.apmx8akep
  - Checklist for your new Open Source JS project - https://ericdouglas.github.io/2015/09/27/checklist-for-your-new-open-source-javascript-project/