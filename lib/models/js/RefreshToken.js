/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = $sql.define({
    name: "RefreshToken",
    columns: [
        "refreshToken",
        "clientId",
        "userId",
        "created"
    ]
});
