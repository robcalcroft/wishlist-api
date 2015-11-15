/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import pg from "pg";

// Test config
if(process.env.WISHLIST_TEST) {
    Wishlist.config.db.database = "wishlist-test";
}

// Database setup
Wishlist.db = new pg.Client(Wishlist.config.db); // Database init - see docs
Wishlist.db.connect(function(err) {
	if(err) {
		throw new Error("Could not connect to database");
	}
});
