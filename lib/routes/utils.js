/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import express from 'express';
import { response, uriMetadata } from 'controllers/utils';

let router = express.Router();

/**
 * @api {get} /uri-metadata Obtain metadata about a URI
 * @apiDescription  Used for front-end field population for images, description etc
 * @apiGroup Utilities
 * @apiVersion 1.0.0
 *
 * @apiPermission Bearer Token
 *
 * @apiHeader {Token} Authorization Your access token
 * @apiHeaderExample {json} Header - Example:
 *     { 'Authorization': 'Bearer <YOURTOKEN>' }
 *
 *
 * @apiParam {String} uri The URL to grab meta data from
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         'results': [{
 *             title: 'Fast Car',
 *             description: 'A very fast car'.
 *             image: 'http://example.com/image.png',
 *             provider_name: 'Example'
 *             uri: 'http://example.com/get-car-picture'
 *         }],
 *         'message': 'Success'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.get(
    '/uri-metadata',
    passport.authenticate('bearer', {
        session: false
    }),
    uriMetadata
);


/**
 * @api {get} /auth/protected Bearer token testing
 * @apiDescription A route to allow clients to test their bearer tokens
 * @apiGroup Utilities
 * @apiVersion 1.0.0
 *
 * @apiPermission Bearer Token
 *
 * @apiHeader {Token} Authorization Your access token
 *
 * @apiHeaderExample {json} Header - Example:
 *     { 'Authorization': 'Bearer <YOURTOKEN>' }
 *
 * @apiSuccessExample {json} Success - Response:
 *     HTTP/1.1 200 OK
 *     {
 *       'statusCode': 200
 *       'message': 'Success'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.get(
    '/auth/protected',
    passport.authenticate('bearer', {
        session: false
    }),
    (req, res) => {
        response(res, {
            status: 200,
            message: 'Success'
        });
    }
);

export default router;
