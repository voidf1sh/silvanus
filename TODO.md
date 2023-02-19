## In Progress
☑ Switch `/setup` to ask for the tree and leaderboard channels
* Switch `/compare` to check for newer trees and leaderboards when run **and** on every refresh

## Future Ideas
* Go through and comment the code

## Variable Structures

guildInfo = {
    guildId: "",
    treeName: "name",
    treeHeight: 0,
    treeMessageId: "",
    treeChannelId: "",
    leaderboardMessageId: "",
    leaderboardChannelId: "",
    reminderMessage: "",
    reminderChannelId: "",
    remindedStatus: 0,
    reminderOptIn: 0,
}

## Expected Behaviors

* Run `/compare` before `/setup`: `/compare` will search the current channel for tree and leaderboard messages, then create a comparison embed. If it can't find `/tree` or `/top trees` messages, it'll return an error saying as much.
* Run `/compare` after `/setup`: ``/compare` will search the current channel for tree and leaderboard messages, then create a comparison embed. If it can't find `/tree` or `/top trees` messages, it'll just use old data silently (odds are `/compare` is being run from another channel, that's fine)
