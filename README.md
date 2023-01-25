# Silvanus
Silvanus is the ultimate Grow A Tree companion bot! Quickly compare your server's tree to others on the leaderboard with automatic calculation of tree height differences, active growth detection, watering time calculations, and more! Get started with /help and /setup, then check out /compare.

Important Note: Silvanus is only as up-to-date as your server's Tree and Tallest Trees messages. Make sure to refresh them before refreshing Silvanus' Compare message.

For the best experience we recommend the use of a single /tree and /top trees message, otherwise make sure to run /setup each time you run /compare.

Silvanus is not affiliated with Grow A Tree or Limbo Labs. 

## Add Silvanus to your server
[Invite Silvanus to your Discord Server](https://discord.com/api/oauth2/authorize?client_id=521624335119810561&permissions=274877908992&scope=bot%20applications.commands)

## voidf1sh Development Support Server
[Join Discord Server](https://discord.gg/g5JRGn7PxU)

## Setup
To begin analyzing your Tree, first you must set up the reference messages.\n\n1. Run `/setup` in the channel(s) that contain your server's tree and leaderboard messages.\n2. Now simply run `/compare` where you want your analysis to be visible.

## Permissions
Silvanus requires permissions to `Send Messages` and `Send Messages in Threads` if applicable.

## Commands
* `/setup` - Automatically detects and saves the location of your server's Tree and Tallest Trees messages. Run this command in the channel(s) that contain these messages.
* `/setupinfo` - Displays links to the current Tree and Tallest Trees messages configured in your server.
* `/compare` - Sends a refreshable embed that calculcates the height difference between your tree and the trees currently displayed on your Tallest Trees message. There is also an Active Growth Indicator (`[+]`) and a water wait time calculation (`[20 mins]`)
* `/watertime height` - Calculates the wait time between waters for a tree of a given height.
* `/reset` - Removes your server's configuration from the database.
* `/help` - Displays the bot's help page and links to each command.