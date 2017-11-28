/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

// ES5 code here, subsequent requires are done using Babel
const chalk = require('chalk');

console.log(chalk.cyan('\n> Starting Up'));

require('babel-core/register');

// Load environment
require('dotenv').load();

console.log(chalk.cyan('> Transpiling Code'));

require('./lib/controllers');
