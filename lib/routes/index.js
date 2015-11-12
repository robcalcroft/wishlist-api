/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    require("./login")(app);
    require("./docs.js")(app);
    require("./oauth2.js")(app);
    require("./error.js")(app);

};
