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
    deleteWishlist,
    getWishlistItem,
    postWishlistItem,
    deleteWishlistItem
} from 'controllers/wishlist';

let router = express.Router();

/**
 * @api {get} /wishlist Get wishlist metadata
 * @apiDescription Gives metadata about each wishlist from the search. If the user id searched for is not the currently authenticated user, only publically viewable wishlists will be shown.
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
 *             'imageURI': 'http://image.com/image.png',
 *             'privacy': 'public'
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
 * @api {post} /wishlist Create new wishlist
 *
 * @apiDescription Creates a new wishlist for the authenticated user
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
 * @apiParam {String} title The title of the wishlist
 * @apiParam {String} [is_default] Set the wishlist as the default wishlist for the user A header image for the list
 * @apiParam {String} [image_uri] A header image for the list
 * @apiParam {String} [privacy=public] The visibility of the wishlist to other users
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         'message': 'Wishlist successfully created'
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
 * @api {delete} /wishlist Delete a wishlist
 *
 * @apiDescription Permenantly deletes the wishlist
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
 * @apiParam {String} wishlist_id The ID of the wishlist
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         'message': 'Wishlist successfully deleted'
 *     }
 *
 * @apiErrorExample {json} Unauthorized delete request
 *     {
 *         'statusCode': 403,
 *         'message': 'The wishlist item given does not belong to the authorised user'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.delete(
    '/wishlist',
    passport.authenticate('bearer', {
        session: false
    }),
    deleteWishlist
);

/**
 * @api {get} /wishlist/item Get detailed wishlist items
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


/**
 * @api {post} /wishlist/item Create entry to wishlist
 * @apiDescription Provide an entry to a specified wishlist (you can use /api/<version>/uri-metadata to get most of the required data below)
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
 * @apiParam {String} wishlist_id The wishlist ID to add the item to
 * @apiParam {String} title The title or name of the entry
 * @apiParam {String} [description] A description of the entry
 * @apiParam {String} source_uri The original uri entered
 * @apiParam {String} [source_name] The provider of the link e.g. Amazon
 * @apiParam {String} [image_uri] An image assosiated with the entry
 * @apiParam {Int} [price] A price for the entry
 * @apiParam {String} [price_currency] The currency the price is in e.g. 'stirling', 'euro', 'us_dollar' - required if price is specified
 * @apiParam {String} [price_currency_symbol] The symbol of the specified currency - required if price is specified
 * @apiParam {Int=0,1,2,3,4,5} [user_priority] The priority the user rates the entry
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         'message': 'Success'
 *     }
 *
 * @apiErrorExample {json} Missing required fields
 *     {
 *         'statusCode': 400,
 *         'message': 'Required fields <FIELDS> must be present'
 *     }
 *
 * @apiErrorExample {json} Price currency or symbol not specified
 *     {
 *         'statusCode': 400,
 *         'message': 'If price is specified, price_currency and price_currency_symbol must be present'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.post(
    '/wishlist/item',
    passport.authenticate('bearer', {
        session: false
    }),
    postWishlistItem
);

/**
 * @api {delete} /wishlist/item Delete an entry to a wishlist
 * @apiDescription Delete an entry to a wishlist
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
 * @apiParam {String} wishlist_item_id The wishlist ID to add the item to
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         'message': 'Wishlist item 1 successfully deleted'
 *     }
 *
 * @apiErrorExample {json} Missing required fields
 *     {
 *         'statusCode': 400,
 *         'message': 'Required fields <FIELDS> must be present'
 *     }
 *
 * @apiErrorExample {json} Wishlist item not found
 *     {
 *         'statusCode': 404,
 *         'message': 'Wishlist item ID not found'
 *     }
 *
 * @apiErrorExample {json} Unauthorized delete request
 *     {
 *         'statusCode': 403,
 *         'message': 'The wishlist item given does not belong to the authorised user'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.delete(
    '/wishlist/item',
    passport.authenticate('bearer', {
        session: false
    }),
    deleteWishlistItem
);

export default router;
