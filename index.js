/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

// ES5 code here, subsequent requires are done using Babel

require("babel-core/register");

// Required globals
Wishlist = {
    appRoot: __dirname
};

console.log("\n> Starting up");

require("./lib/controllers/wishlist");
