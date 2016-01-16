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
    if(!req.query.wishlist_id && !req.query.user_id) {
        return response(res, {
            status: 400,
            message: 'Wishlist ID or User ID required for request'
        });
    }

    db.query(
        Wishlist
            .select()
            .where(
                Wishlist.wishlistId.equals(req.query.wishlist_id)
            ).or(
                Wishlist.userId.equals(req.query.user_id)
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
    if(
        !req.query.title ||
        !req.query.is_default ||
        !req.query.image_uri ||
        !req.query.user_id
    ) {
        return response(res, {
            status: 400,
            message: 'Required field missing, consult documentation'
        });
    }

    db.query(
        Wishlist
            .insert({
                title: req.query.title,
                isDefault: req.query.is_default,
                imageURI: req.query.image_uri,
                userId: req.query.user_id
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

export {
    getWishlist,
    postWishlist,
    getWishlistItem
};
