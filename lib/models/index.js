/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function() {

    // Load all the models
    $AuthCodeM = require("./js/AuthCode.js");
    $AccessTokenM = require("./js/AccessToken.js");
    $ClientM = require("./js/Client.js");
    $UserM = require("./js/User.js");

};
