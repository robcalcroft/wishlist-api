/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import pg from "pg";

// Test config
if(process.env.WISHLIST_TEST) {
    process.env.DB_NAME = "wishlist-test";
}

let dbConfig = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

let db = new pg.Client(dbConfig);
db.connect(function(err) {
	if(err) {
		throw new Error("Could not connect to database");
	}
});

export default db;
