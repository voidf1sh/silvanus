# Silvanus
Silvanus is the ultimate Grow A Tree companion bot! Quickly compare your server's tree to others on the leaderboard with automatic calculation of tree height differences, active growth detection, watering time calculations, and more!

Important Note: Silvanus is only as up-to-date as your server's newest Tree and Tallest Trees messages. Make sure to refresh them before refreshing Silvanus' Compare message.

Silvanus is not affiliated with Grow A Tree or Limbo Labs. 

## Add Silvanus to your server
[Invite Silvanus to your Discord Server](https://discord.com/api/oauth2/authorize?client_id=521624335119810561&permissions=274877908992&scope=bot%20applications.commands)

## voidf1sh Development Support Server
[Join Discord Server](https://discord.gg/g5JRGn7PxU)

## Setup

If your `/tree` and `/top trees` messages are in the same channel, simply run `/compare` in that channel and you're good to go!

Otherwise, run `/setup compare` to set the proper channels for the bot to look in for the `/tree` and `/top trees` messages.

Use `/commands` to view a description of all my commands.

## Permissions
Silvanus requires permissions to `Send Messages` and `Send Messages in Threads` if applicable. If you plan to use the Role Menu Silvanus will also need permission to `Manage Roles`.

## Commands
* `/compare` - Compare your tree to others on the leaderboard
* `/relay set` - Setup a Notification Relay for the first time
* `/relay update` - Update an already configured Notification Relay
* `/relay disable` - Disable the Notification Relay
* `/rolemenu` - Send a self-assignable role menu for relay pings
* `/watertime` - Calculates the time between waters for a tree of a given height
* `/timetoheight` - Calculates how long it would take a tree to grow to a given height
* `/setup compare` - Set the channels to use with `/compare`
* `/setup view` - View your server's configuration
* `/setup reset` - Delete your server's configuration
* `/help` - Displays the bot's help page