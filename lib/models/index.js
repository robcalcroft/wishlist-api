/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function() {

    // Load all the models
    $AuthCodeM = require("./js/AuthCode");
    $AccessTokenM = require("./js/AccessToken");
    $ClientM = require("./js/Client");
    $UserM = require("./js/User");
    $RefreshTokenM = require("./js/RefreshToken");

};
