/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    var oauth2 = require($appRoot + "/lib/controllers/oauth2");

    app.get("/auth/authorize", oauth2.authorize);

    app.post("/auth/decision", oauth2.decison);

    app.post("/auth/token", oauth2.authorize);

};
