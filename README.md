# Grow A Tree Analyzer
This bot works with Grow A Tree Bot by Limbo Labs. This project is not affiliated with Limbo Labs in any way.

This bot allows easy comparison between a server's tree and other trees displayed on the leaderboard.

## Usage
Add the bot to your server and make sure it has the proper permissions (`Send Messages` and `Send Messages in Threads` if applicable), then run `/setup` in the channel(s) that contain your server's tree and leaderboard messages.

## Commands

* `/setup` - Attempts automatic detection of your server's tree and leaderboard messages.
* `/setupinfo` - Displays your server's current configuration.
* `/reset` - Resets your server's configuration, run `/setup` again if needed.


## Database Structure

### Table: guildinfo
```
+-----------------+-------------+------+-----+---------+----------------+
| Field           | Type        | Null | Key | Default | Extra          |
+-----------------+-------------+------+-----+---------+----------------+
| id              | int(10)     | NO   | PRI | NULL    | auto_increment |
| guild_id        | varchar(50) | NO   |     | NULL    |                |
| tree_message_id | varchar(50) | NO   |     | NULL    |                |
| tree_channel_id | varchar(50) | NO   |     | NULL    |                |
| rank_message_id | varchar(50) | NO   |     | NULL    |                |
| rank_channel_id | varchar(50) | NO   |     | NULL    |                |
| tree_height     | varchar(10) | NO   |     | NULL    |                |
+-----------------+-------------+------+-----+---------+----------------+
```
### Table: treeinfo
```
+-----------+--------------+------+-----+---------+----------------+
| Field     | Type         | Null | Key | Default | Extra          |
+-----------+--------------+------+-----+---------+----------------+
| id        | int(10)      | NO   | PRI | NULL    | auto_increment |
| treename  | varchar(100) | NO   |     | NULL    |                |
| treerank  | int(10)      | NO   |     | NULL    |                |
| timestamp | varchar(50)  | NO   |     | NULL    |                |
+-----------+--------------+------+-----+---------+----------------+
```

## Changes to Implement

* Move around some of the functions.
* Migrate storage to SQLite.