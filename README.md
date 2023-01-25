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

### Table: guild_info
```
+------------------------+-------------+------+-----+---------+----------------+
| Field                  | Type        | Null | Key | Default | Extra          |
+------------------------+-------------+------+-----+---------+----------------+
| guild_id               | varchar(50) | NO   | PRI | NULL    | auto_increment |
| tree_message_id        | varchar(50) | NO   |     |         |                |
| tree_channel_id        | varchar(50) | NO   |     |         |                |
| leaderboard_message_id | varchar(50) | NO   |     |         |                |
| leaderboard_channel_id | varchar(50) | NO   |     |         |                |
| tree_height            | varchar(10) | NO   |     | 0       |                |
+------------------------+-------------+------+-----+---------+----------------+

```
### Table: leaderboard_info
```
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| id          | int(10)      | NO   | PRI | NULL    | auto_increment |
| guild_id    | varchar(50)  | NO   |     |         |                |
| tree_name   | varchar(100) | NO   |     |         |                |
| tree_rank   | int(10)      | NO   |     |         |                |
| tree_height | int(10)      | NO   |     | 0       |                |
| has_pin     | tinyint(1)   | NO   |     | 0       |                |
| timestamp   | varchar(50)  | NO   |     |         |                |
+-------------+--------------+------+-----+---------+----------------+
```

## Changes to Implement

* Move around some of the functions.
* Migrate storage to SQLite.