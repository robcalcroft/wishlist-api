/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

Wishlist.app.use("/docs", Wishlist.app.get("express").static(Wishlist.appRoot + "/docs/html"));
