/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = $sql.define({
    name: "AccessToken",
    columns: [
        "accessToken",
        "clientId",
        "userId"
    ]
});
