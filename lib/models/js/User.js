/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = $sql.define({
    name: "User",
    columns: [
        "userId",
        "emailAddress",
        "username",
        "password",
        "firstName",
        "lastName",
        "DOB",
        "dateCreated"
    ]
});
