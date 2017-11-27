/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import sqlite3 from 'sqlite3';

// Test config
if (process.env.WISHLIST_TEST) {
  process.env.PGDATABASE = 'wishlist-test';
}

const db = new sqlite3.Database('wishlist.database');

export default db;
