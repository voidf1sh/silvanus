# About Nodbot
Nodbot is a content saving and serving Discord bot. Nodbot is able to search Tenor for GIFs, save custom copypastas, and look up marijuana strain information. Nodbot is in semi-active development by voidf1sh. It's buggy as hell and very shoddily built. Don't use it.

# Nodbot Help

Use the `/help` command to see the bot's help message.

## Create Docker Image
`docker build --tag=name/nodbot .`

## Push Docker Image
`docker push name/nodbot`

# Immediate To-Do

1. ~~Sanitize inputs for SQL queries.~~ Done.
2. ~~Move environment variables so they don't get included in the image.~~
3. Implement error handling on all actions.
4. Ephemeral responses to some/most slash commands.
5. Comment the code! Document!
6. Check for and create database tables if necessary. Handle errors.

# Deploy NodBot Yourself

1. Create an application at the [Discord Developer Portal](https://discord.com/developers/applications)
2. Convert the application into a Bot
3. Note down the token provided and keep this safe. You cannot view this token again, only regenerate a new one.
4. Create a Tenor account and obtain an API key.
5. Install and configure MySQL or MariaDB with a user for the bot and a datbase
* Create the table structure as outlined below (* Nodbot will soon create its own table structure)
6. Configure your environment variables as outlined below.
7. Fire it up with `node main.js`

## Table Structure

```
Table: gifs
+-----------+---------------+------+-----+---------+----------------+
| Field     | Type          | Null | Key | Default | Extra          |
+-----------+---------------+------+-----+---------+----------------+
| id        | int(11)       | NO   | MUL | NULL    | auto_increment |
| name      | varchar(100)  | NO   |     | NULL    |                |
| embed_url | varchar(1000) | NO   |     | NULL    |                |
+-----------+---------------+------+-----+---------+----------------+

Table: joints
+---------+---------------+------+-----+---------+----------------+
| Field   | Type          | Null | Key | Default | Extra          |
+---------+---------------+------+-----+---------+----------------+
| id      | int(11)       | NO   | MUL | NULL    | auto_increment |
| content | varchar(1000) | NO   |     | NULL    |                |
+---------+---------------+------+-----+---------+----------------+

Table: pastas
+---------+---------------+------+-----+---------+----------------+
| Field   | Type          | Null | Key | Default | Extra          |
+---------+---------------+------+-----+---------+----------------+
| id      | int(11)       | NO   | MUL | NULL    | auto_increment |
| name    | varchar(100)  | NO   |     | NULL    |                |
| content | varchar(1900) | NO   |     | NULL    |                |
| iconurl | varchar(200)  | NO   |     | (url)   |                |
+---------+---------------+------+-----+---------+----------------+

Table: requests
+---------+---------------+------+-----+---------+----------------+
| Field   | Type          | Null | Key | Default | Extra          |
+---------+---------------+------+-----+---------+----------------+
| id      | int(11)       | NO   | MUL | NULL    | auto_increment |
| author  | varchar(100)  | NO   |     | NULL    |                |
| request | varchar(1000) | NO   |     | NULL    |                |
| status  | varchar(10)   | YES  |     | Active  |                |
+---------+---------------+------+-----+---------+----------------+

Table: strains
+---------+-------------+------+-----+---------+-------+
| Field   | Type        | Null | Key | Default | Extra |
+---------+-------------+------+-----+---------+-------+
| id      | smallint(6) | NO   |     | NULL    |       |
| name    | varchar(60) | YES  |     | NULL    |       |
| type    | varchar(10) | YES  |     | NULL    |       |
| effects | varchar(80) | YES  |     | NULL    |       |
| ailment | varchar(70) | YES  |     | NULL    |       |
| flavor  | varchar(30) | YES  |     | NULL    |       |
+---------+-------------+------+-----+---------+-------+
```

## Environment Variables
```
TOKEN=<your bot's token from step 3>
isDev=<true/false>
dbHost=<mySQL host>
dbPort=<mySQL port (3306)>
dbUser=<mySQL username>
dbPass=<mySQL user password>
dbName=<mySQL table name>
tenorAPIKey=<Tenor API Key>
ownerId=<your Discord user ID>
statusChannelId=<Discord channel ID of channel used for status messages>
clientId=<Discord user ID of your bot>
```