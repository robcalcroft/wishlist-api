/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

 import db from 'controllers/db';
 import WishlistM from 'models/Wishlist';
 import WishlistItemM from 'models/WishlistItem';
 import { response } from 'controllers/utils';

function wishlist(req, res) {
    if(!req.query.wishlist_id && !req.query.user_id) {
        return response(res, {
            status: 400,
            message: 'Wishlist ID or User ID required for request'
        });
    }

    db.query(
        WishlistM
            .select()
            .where(
                WishlistM.wishlistId.equals(req.query.wishlist_id)
            ).or(
                WishlistM.userId.equals(req.query.user_id)
            )
            .order(
                (/^asc$/i.test(req.query.order) ? WishlistM.dateCreated : WishlistM.dateCreated.descending)
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

function wishlistItem(req, res) {
    if(!req.query.wishlist_id) {
        return response(res, {
            status: 400,
            message: 'Wishlist ID required for request'
        });
    }

    db.query(
        WishlistItemM
            .select()
            .where(
                WishlistItemM.wishlistId.equals(req.query.wishlist_id)
            )
            // Using literals to act as a 'do nothing' to the where clause
            .and(
                (req.query.price_low && req.query.price_high ? WishlistItemM.price.between(req.query.price_low,req.query.price_high) : WishlistItemM.literal('1=1'))
            )
            .and(
                (req.query.priority ? WishlistItemM.userPriority.in(req.query.priority.split(',')) : WishlistItemM.literal('1=1'))
            )
            .order(
                (/^asc$/i.test(req.query.order) ? WishlistItemM.dateCreated : WishlistItemM.dateCreated.descending)
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
    wishlist,
    wishlistItem
};
