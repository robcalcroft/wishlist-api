# wishlist-api

Final year project for Rob Calcroft

# Requirements
- [NodeJS](https://nodejs.org/en/download/)
- [PostgreSQL](http://www.postgresql.org/download/)
- [PostGIS](http://postgis.net/install)
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

# OAuth2 Flow
This guide describes the OAuth2 flow for OAuth2 authentication with Wishlist.

#### Get permission from the user
Open the following in a dialog box.
```
GET http://example.com/auth/authorize?client_id=*&response_type=code&redirect_uri=*
```
The user will be asked to log in (if they aren't already), and will be presented with the option to accept or deny your request for permission. If they accept your redirect URI will be called like so:
```
http://example.com/callback?code=*
```
This is your authorization code, you will use it to exchange for a token.

If they deny, your redirect URI will be called like so:
```
http://example.com/callback?error=access_denied
```
#### Obtain a token
Tokens are given in exchange for your authorization code - your authorization code will be redundant after using it to obtain a token.

Make a request to the following URL:
```
POST http://api.example.com/auth/token
```
The body of the request can be either `application/json` or `x-www-form-urlencoded`, the former is recommended.
```json
{
    "client_id": "*",
    "client_secret": "*",
    "code": "YOUR AUTHORIZATION CODE",
    "grant_type": "auth_code",
    "redirect_uri": "*"
}
```
If your details are accepted, you will receive the following response:
```json
{
    "access_token": "*",
    "expires": "UNIX TIMESTAMP",
    "grant_type": "Bearer"
}
```
