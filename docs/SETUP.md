##Install

1. `git clone https://github.com/robcalcroft/wishlist-api.git`
2. Install [NodeJS](https://nodejs.org/en/download/)
3. `npm i`
4. `npm rebuild` - for bcrypt
5. Install [PostgreSQL](http://www.postgresql.org/download/) for your [*nix](https://en.wikipedia.org/wiki/Unix-like)
6. Create a `~/.pgpass` file ([instructions](http://www.postgresql.org/docs/9.3/static/libpq-pgpass.html) it may look like `127.0.0.1:5432:wishlist:wishlist:<PASSWORD>`) with entries for `postgres` and `wishlist`, you'll create the `wishlist` user in a few steps.
7. Create a `.env` file in the root using `.env-sample`
8. Setup the database user

  ```sql
  create user wishlist with SUPERUSER CREATEROLE CREATEDB REPLICATION PASSWORD '<NEWPASSWORD>';
  ```
9. Build the database by `npm run db-build` (rebuild using `npm run db-rebuild`, destroy using `npm run db-destroy` and seed for testing with `npm run db-seed`)

##Startup
**development**
```bash
npm start
```

**production (using [pm2](https://github.com/Unitech/pm2))**
```bash
NODE_PATH=./lib pm2 start index.js --name wishlist-api
```

##Testing
```bash
npm test
```
*See `bin/test.sh` for more info*
