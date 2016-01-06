/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import sql from 'sql';

export default sql.define({
    name: 'Wishlist',
    columns: [
        'userId',
        'wishlistId',
        'title',
        'dateCreated',
        'isDefault',
        'imageURI'
    ]
});
