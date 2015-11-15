/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import sql from "sql";

export default sql.define({
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