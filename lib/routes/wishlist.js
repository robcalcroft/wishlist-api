/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import express from 'express';
import {
    getWishlist,
    postWishlist,
    getWishlistItem
} from 'controllers/wishlist';

let router = express.Router();

/**
 * @api {get} /wishlist Obtain wishlist metadata
 * @apiDescription Gives metadata about each wishlist from the search
 * @apiGroup Wishlist
 * @apiVersion 1.0.0
 *
 * @apiPermission Bearer Token
 *
 * @apiHeader {Token} Authorization Your access token
 * @apiHeaderExample {json} Header - Example:
 *     { 'Authorization': 'Bearer <YOURTOKEN>' }
 *
 *
 * @apiParam {String} wishlist_id The wishlist ID to search upon
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
    getWishlist
);

/**
 * @api {post} /wishlist Create new wishlist for user
 *
 * @apiDescription Creates a new wishlist for the user with details
 * @apiGroup Wishlist
 * @apiVersion 1.0.0
 *
 * @apiPermission Bearer Token
 *
 * @apiHeader {Token} Authorization Your access token
 * @apiHeaderExample {json} Header - Example:
 *     { 'Authorization': 'Bearer <YOURTOKEN>' }
 *
 *
 * @apiParam {String} user_id The user id to add the wishlist to TODO Make it restricted to req.user
 * @apiParam {String} title The title of the wishlist
 * @apiParam {String} [is_default] Set the wishlist as the default wishlist for the user A header image for the list
 * @apiParam {String} [image_uri] A header image for the list
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         'message': 'Wishlist successfully added'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.post(
    '/wishlist',
    passport.authenticate('bearer', {
        session: false
    }),
    postWishlist
);

/**
 * @api {get} /wishlist/item Obtain detailed wishlist items
 * @apiDescription Gives all entries to a wish list
 * @apiGroup Wishlist
 * @apiVersion 1.0.0
 *
 * @apiPermission Bearer Token
 *
 * @apiHeader {Token} Authorization Your access token
 * @apiHeaderExample {json} Header - Example:
 *     { 'Authorization': 'Bearer <YOURTOKEN>' }
 *
 *
 * @apiParam {String} wishlist_id The wishlist ID to search upon
 * @apiParam {Int} [price_low] Price filtering between values - mandatory if companion option is specified.
 * @apiParam {Int} [price_high] Price filtering between values - mandatory if companion option is specified.
 * @apiParam {Int=1,2,3,4,5} [priority] Filter the priority of results. Multiples can be specified by a comma: priority=5,4
 * @apiParam {String='desc','asc'} [order] The order of the results
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         'results': [{
 *             'userId': 1,
 *             'wishlistId': 1,
 *             'wishlistItemId': 4,
 *             'title': 'iPhone 5',
 *             'description': 'Good-ish phone',
 *             'sourceURI': 'http://www.amazon.co.uk/gp/product/B0117RGG8E/ref=s9_simh_gw_p23_d0_i1?pf_rd_m=A3P5ROKL5A1OLE&pf_rd_s=desktop-1&pf_rd_r=06WRCG8HYERKXBE7XX2A&pf_rd_t=36701&pf_rd_p=577047927&pf_rd_i=desktop',
 *             'sourceName': 'Amazon',
 *             'imageURI': 'https://www.drupal.org/files/issues/header_1.png',
 *             'price': 50,
 *             'priceCurrency': 'stirling',
 *             'priceCurrencySymbol': '£',
 *             'userPriority': 3,
 *             'dateCreated': '2016-01-13T20:25:46.939Z'
 *         }],
 *         'message': 'success'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.get(
    '/wishlist/item',
    passport.authenticate('bearer', {
        session: false
    }),
    getWishlistItem
);

export default router;
