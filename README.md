# Silvanus
Silvanus is the ultimate Grow A Tree companion bot! Quickly compare your server's tree to others on the leaderboard with automatic calculation of tree height differences, active growth detection, watering time calculations, and more!

Important Note: Silvanus is only as up-to-date as your server's newest Tree and Tallest Trees messages. Make sure to refresh them before refreshing Silvanus' Compare message.

Silvanus is not affiliated with Grow A Tree or Limbo Labs. 

## Add Silvanus to your server
[Invite Silvanus to your Discord Server](https://discord.com/api/oauth2/authorize?client_id=521624335119810561&permissions=274877908992&scope=bot%20applications.commands)

## voidf1sh Development Support Server
[Join Discord Server](https://discord.gg/g5JRGn7PxU)

## Setup

If your `/tree` and `/top trees` messages are in the same channel, simple run `/compare` in that channel and you're good to go!

Otherwise, run `/setup` to set the proper channels for the bot to look in for the `/tree` and `/top trees` messages.

Use `/commands` to view a description of all my commands.

## Permissions
Silvanus requires permissions to `Send Messages` and `Send Messages in Threads` if applicable.

## Commands
* `/setup` - You only need to run this command if your server has its `/tree` and `/top trees` messages in separate channels.
* `/setupinfo` - Displays your server's configuration information.
* `/compare` - Sends a refreshable embed that calculcates the height difference between your tree and the trees currently displayed on your Tallest Trees message. There is also an Active Growth Indicator (`[💧]`).
* `/notifications` - Guild members with the `Manage Roles` permission can run this command to set up automatic reminders when your tree is ready to be watered or when fruit is dropping.
    * This feature relies on Grow A Tree's built-in Notification system. Refer to Grow A Tree for instructions on setting them up.
    * `watchchannel`: Select the channel you've configured Grow A Tree to send notifications in.
    * `watermessage`: This option sets the message to send when the tree is ready to be watered. This can include `@pings`, links, etc.
    * `pingchannel`: Select the channel you want Silvanus to forward the notifications to.
    * `fruitmessage`: Optional: This sets the message to send when the tree is dropping fruit. If not set, the `watermessage` will be used instead.
* `/rolemenu` - Creates a menu for users to give themselves Water and Fruit pingable roles.
    * Requires `Manage Roles` permission to run.
    * `waterrole`: Select the role to give users when they select the Water button
    * `fruitrole`: Optional: Select the role to give users when they select the Fruit button
        * If this option isn't set, no Fruit Role will be available for self-assignment.
* `/watertime` - Calculates the wait time between waters for a tree of a given height.
    * `height`: The height in feet to calculate for.
* `/timetoheight` - Calculates how long it would take to grow to a height
    * `endheight`: The destination height, in feet.
    * `beginheight`: Optional: The starting height, in feet. If this option isn't set, the current height of your tree will be used insead.
* `/reset` - Removes your server's configuration from the database.
* `/help` - Displays the bot's help page and links to each command.