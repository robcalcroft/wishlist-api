/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

// ES5 code here, subsequent requires are done using Babel

require("babel-core/register");

// Load environment
require("dotenv").load();

console.log("\n> Starting up");

require("./lib/controllers/wishlist");
