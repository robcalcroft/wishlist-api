/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import express from 'express';
import { authorize, decison, token } from '../controllers/oauth2';

const router = express.Router();

/**
 * @api {get} /auth/authorize User authorization
 * @apiDescription This route is opened in a new window for the user
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiParam {String} client_id Your client ID
 * @apiParam {String} response_type The response type you wish to obtain, usually <code>code</code>
 * @apiParam {String} redirect_uri The redirect URI you setup for your client
 *
 * @apiSuccessExample {json} Success
 *     GET http://example.com/callback?code=<AUTHCODE>
 *
 * @apiErrorExample {json} Error
 *     GET http://example.com/callback?error=access_denied
 *
 */

router.get('/auth/authorize', authorize);

router.post('/auth/decision', decison);

/**
 * @api {post} /auth/token Getting a token
 * @apiDescription This route is used to obtain a token using a refresh token or an authorization
 * code
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiParam {String} client_id Your client ID
 * @apiParam {String} client_secret Your client secret
 * @apiParam {String} code Your auth code, only one of the <code>code</code> or
 * <code>refresh_token</code> is needed
 * @apiParam {String} refresh_token Your refresh token, only one of the <code>code</code> or
 * <code>refresh_token</code> is needed
 * @apiParam {String='authorization_code', 'refresh_token'} grant_type The grant type you wish to
 * use
 * @apiParam {String} redirect_uri The redirect URI you setup for your client
 *
 * @apiSuccessExample {json} Success - auth code grant type
 *     {
 *         'access_token': '<ACCESSTOKEN>',
 *         'refreshToken': '<REFRESHTOKEN>',
 *         'expires_in': '<EXPIRESIN>',
 *         'grant_type': 'Bearer'
 *     }
 *
 * @apiSuccessExample {json} Success - refresh token grant type
 *     {
 *         'access_token': '<ACCESSTOKEN>',
 *         'expires_in': '<EXPIRESIN>',
 *         'grant_type': 'Bearer'
 *     }
 *
 * @apiErrorExample {json} Error
 *     401 Unauthorized
 *
 */
router.post('/auth/token', token);

export default router;
