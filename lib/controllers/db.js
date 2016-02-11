/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import pg from 'pg';
import chalk from 'chalk';

// Test config
if(process.env.WISHLIST_TEST) {
    process.env.PGDATABASE = 'wishlist-test';
}

let db = new pg.Client();

db.connect((err) => {
	if(err) {
		throw new Error('Could not connect to database');
	}
});

export default db;
