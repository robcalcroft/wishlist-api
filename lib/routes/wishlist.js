/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import express from 'express';
import db from 'controllers/db';
import passport from 'passport';
import { response } from 'controllers/utils';
import WishlistM from 'models/Wishlist';

let router = express.Router();

/**
 * @api {get} /wishlist Obtain wishlist metadata
 * @apiDescription Gives metadata about each wishlist from the search
 * @apiGroup Wishlist
 *
 * @apiPermission Bearer Token
 *
 * @apiParam {String} id The wishlist ID to search upon
 * @apiParam {String} user_id Grab all wishlists for the corresponding user
 * @apiParam {String='desc','asc'} [order] The order of the results
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         'results': [{
 *             'wishlistId': 1,
 *             'userId': 2,
 *             'title': 'Main List',
 *             'dateCreated': '2016-01-06 23:23:01.115716',
 *             'isDefault': true,
 *             'imageURI': 'http://image.com/image.png'
 *         }],
 *         'message': 'success'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.get(
    '/wishlist',
    passport.authenticate('bearer', {
        session: false
    }),
    (req, res) => {
        if(!req.query.id && !req.query.user_id) {
            return response(res, {
                status: 400,
                message: 'Wishlist ID or User ID required for request'
            });
        }

        db.query(
            WishlistM
                .select()
                .where(
                    WishlistM.wishlistId.equals(req.query.id)
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
                        message: `Wishlist with ID ${req.query.id || req.query.user_id} was not found`
                    });
                }

                response(res, {
                    status: 200,
                    result: result.rows
                });
            }
        );
    }
);

export default router;
