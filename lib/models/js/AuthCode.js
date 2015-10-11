/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = $sql.define({
    name: "AuthCode",
    columns: [
        "authCode",
        "clientId",
        "userId",
        "redirectURI"
    ]
});
