/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    app.use("/docs", app.get("express").static($appRoot + "/docs/html"));

};
