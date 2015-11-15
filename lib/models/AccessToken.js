/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import sql from "sql";

export default sql.define({
    name: "AccessToken",
    columns: [
        "accessToken",
        "clientId",
        "userId",
        "created"
    ]
});
