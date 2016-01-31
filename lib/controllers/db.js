/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import pg from 'pg';
import chalk from 'chalk';

// Test config
if(process.env.WISHLIST_TEST) {
    process.env.DB_NAME = 'wishlist-test';
}

let db = new pg.Client({
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
	if(err) {
		throw new Error('Could not connect to database');
	}
});

export default db;
