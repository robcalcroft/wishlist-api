/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

 import db from 'controllers/db';
 import Wishlist from 'models/Wishlist';
 import WishlistItem from 'models/WishlistItem';
 import { response } from 'controllers/utils';

function getWishlist(req, res) {
    let isAuthenticatedUser = false;

    if(!req.query.wishlist_id && !req.query.user_id) {
        return response(res, {
            status: 400,
            message: 'Wishlist ID or User ID required for request'
        });
    }

    if(req.query.user_id === req.user.userId) {
        isAuthenticatedUser = true;
    }

    db.query(
        Wishlist
            .select()
            .where(
                Wishlist.wishlistId.equals(req.query.wishlist_id)
            )
            .or(
                Wishlist.userId.equals(req.query.user_id)
            )
            .or(
                !isAuthenticatedUser ? Wishlist.privacy.equals('public') : Wishlist.literal('1=1')
            )
            .order(
                (/^asc$/i.test(req.query.order) ? Wishlist.dateCreated : Wishlist.dateCreated.descending)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    debug: err,
                    message: 'Something went wrong, try again'
                });
            }

            if(!result.rows.length) {
                return response(res, {
                    status: 404,
                    message: `Wishlist with ID ${req.query.wishlist_id || req.query.user_id} was not found`
                });
            }

            response(res, {
                status: 200,
                result: result.rows
            });
        }
    );
}

function postWishlist(req, res) {
    if(!req.body.title) {
        return response(res, {
            status: 400,
            message: 'Required field \'title\' missing'
        });
    }

    db.query(
        Wishlist
            .insert({
                title: req.body.title,
                isDefault: req.body.is_default || 'false',
                imageURI: req.body.image_uri || null,
                userId: req.user.userId,
                privacy: req.body.privacy || 'public'
            })
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    debug: err,
                    message: 'Something went wrong, try again'
                });
            }

            response(res, {
                status: 200,
                message: 'Wishlist created successfully'
            });
        }
    );
}

function getWishlistItem(req, res) {
    if(!req.query.wishlist_id) {
        return response(res, {
            status: 400,
            message: 'Wishlist ID required for request'
        });
    }

    db.query(
        WishlistItem
            .select()
            .where(
                WishlistItem.wishlistId.equals(req.query.wishlist_id)
            )
            // Using literals to act as a 'do nothing' to the where clause
            .and(
                (req.query.price_low && req.query.price_high ? WishlistItem.price.between(req.query.price_low,req.query.price_high) : WishlistItem.literal('1=1'))
            )
            .and(
                (req.query.priority ? WishlistItem.userPriority.in(req.query.priority.split(',')) : WishlistItem.literal('1=1'))
            )
            .order(
                (/^asc$/i.test(req.query.order) ? WishlistItem.dateCreated : WishlistItem.dateCreated.descending)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    debug: err,
                    message: 'Something went wrong, try again'
                });
            }

            if(!result.rows.length) {
                return response(res, {
                    status: 404,
                    message: `Wishlist items with ID ${req.query.wishlist_id} was not found`
                });
            }

            response(res, {
                status: 200,
                result: result.rows
            });
        }
    );
}

function postWishlistItem(req, res) {
    let missingFields = [];

    if(!req.user.userId) {
        return response(res, {
            status: 500,
            message: 'Internal error: no user available'
        });
    }

    if(!req.body.wishlist_id) {
        missingFields.push('wishlist_id');
    }

    if(!req.body.title) {
        missingFields.push('title');
    }

    if(!req.body.source_uri) {
        missingFields.push('source_uri');
    }

    if(missingFields.length > 0) {
        return response(res, {
            status: 400,
            message: `Required fields ${missingFields.join(', ')} must be present`
        });
    }

    // Need all price parts
    if(req.body.price) {
        if(!req.body.price_currency || !req.body.price_currency_symbol) {
            return response(res, {
                status: 400,
                message: 'If price is specified, price_currency and price_currency_symbol must be present'
            });
        }
    }

    db.query(
        WishlistItem
            .insert({
                userId: req.user.userId,
                wishlistId: req.body.wishlist_id,
                title: req.body.title,
                description: req.body.description,
                sourceURI: req.body.source_uri,
                sourceName: req.body.sourceName,
                imageURI: req.body.image_uri,
                price: req.body.price,
                priceCurrency: req.body.price_currency,
                priceCurrencySymbol: req.body.price_currency_symbol,
                userPriority: req.body.user_priority
            })
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    message: 'Internal error',
                    debug: err
                });
            }

            response(res, {
                status: 200,
                message: 'Success'
            });
        }
    );


}

export {
    getWishlist,
    postWishlist,
    getWishlistItem,
    postWishlistItem
};
