/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = $sql.define({
    name: "Client",
    columns: [
        "applicationName",
        "applicationURL",
        "clientId",
        "clientSecret"
    ]
});
