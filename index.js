/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

console.log('\n> 🚌  Starting up');
// ES5 code here, subsequent requires are done using Babel

require('babel-core/register');

// Load environment
require('dotenv').load();

console.log('> 🚜  Transpiling code');

require('./lib/controllers');
