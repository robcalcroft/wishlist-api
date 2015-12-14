##Install

1. `git clone https://github.com/robcalcroft/wishlist-api.git`
2. Install [NodeJS](https://nodejs.org/en/download/)
3. `npm i`
4. Install [PostgreSQL](http://www.postgresql.org/download/) for your [*nix](https://en.wikipedia.org/wiki/Unix-like)
5. Create a `.env` file in the root using `.env-sample`
6. Setup the database user

  ```sql
  create user wishlist with SUPERUSER CREATEROLE CREATEDB REPLICATION PASSWORD '<NEWPASSWORD>';
  ```
7. Build the database by `cd bin && ./db-create` (rebuild using `./db-rebuild` and destroy using `./db-destroy`)

##Startup
**development**
```bash
npm start
```

**production (using [pm2](https://github.com/Unitech/pm2))**
```bash
NODE_PATH=./lib pm2 start index.js
```

##Testing
```bash
npm test
```
*See `bin/test.sh` for more info*
