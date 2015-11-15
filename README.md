# wishlist-api

Final year project for Rob Calcroft

# Requirements
- [NodeJS](https://nodejs.org/en/download/)
- [PostgreSQL](http://www.postgresql.org/download/)
- Dependancies - `npm install --production`

# Config
The included `config.json` file needs to have your database details in as well as your region (set to `en` by default).

# Database
For the database scripts to work correctly, you will need a `wishlist` user and a `postgres` user that have the following properties:
```sql
-- Wishlist/Postgres user
create user wishlist/postgres with SUPERUSER CREATEROLE CREATEDB REPLICATION PASSWORD '<NEWPASSWORD>';
```
Then to setup the database run:
```bash
cd bin && ./db-create.sh
```
To destroy the database run:
```bash
cd bin && ./db-destroy.sh
```

# Startup
1. Ensure PostgreSQL is running
2. Ensure `.env` has `NODE_PATH=./lib` in it.
3. Start the API - `npm start`

# API Documentation
Documentation comes in the form of Markdown documents, stored in `docs/md` or web REST API documentation located at `example.com/docs`.

# Testing
Install the repo with dev dependancies and run `npm test`. The test script builds a test database called `wishlist-test` in your PostgreSQL database and then destroys it afterwards. See `bin/test.sh` for info.
