/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    require("./login")(app);

    require("./oauth.js")(app);

};
