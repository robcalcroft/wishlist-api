/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    require("./auth.js");
    require("./oauth2.js")(app);
    $utils = require("./utils")(app);

};
