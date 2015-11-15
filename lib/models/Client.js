/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import sql from "sql";

export default sql.define({
    name: "Client",
    columns: [
        "applicationName",
        "applicationURL",
        "clientId",
        "clientSecret"
    ]
});
