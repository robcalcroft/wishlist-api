/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import sql from 'sql';

export default sql.define({
    name: 'WishlistItem',
    columns: [
        'userId',
        'wishlistId',
        'wishlistItemId',
        'title',
        'description',
        'sourceURI',
        'sourceName',
        'imageURI',
        'price',
        'priceCurrency',
        'priceCurrencySymbol',
        'userPriority',
        'dateCreated'
    ]
});
