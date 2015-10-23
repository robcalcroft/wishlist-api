# wishlist-api

Final year project for Rob Calcroft

# Requirements
- [NodeJS](https://nodejs.org/en/download/)
- [PostgreSQL](http://www.postgresql.org/download/)
- Dependancies - `npm install --production`

# Setup

##  Database
For the database scripts to work correctly, you will need a `wishlist` user and a `postgres` user that have the following properties:
```sql
-- Wishlist/Postgres user
create user wishlist/postgres with SUPERUSER CREATEROLE CREATEDB REPLICATION PASSWORD '<newpassword>';
```
Then to setup the database run:
```bash
cd bin && ./db-create.sh
```
To destroy the database run:
```bash
cd bin && ./db-destroy.sh
```

## Startup
1. Ensure PostgreSQL is running
2. For production - `export NODE_ENV=production`
3. Set your port (default is 8000) - `export PORT=6666`
4. Start the API - `node index.js` or `nodemon` or `forever start index.js` or however you run Node apps
