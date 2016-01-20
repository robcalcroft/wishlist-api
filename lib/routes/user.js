/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import express from 'express';
import {
    getSearchUsers,
    getAuthenticatedUser,
    getAuthorisedApps
} from 'controllers/user';

let router = express.Router();

/**
 * @api {get} /user/search Search for users
 *
 * @apiDescription Search based on email address or username. Email address must be in full
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiPermission Bearer Token
 *
 * @apiHeader {Token} Authorization Your access token
 * @apiHeaderExample {json} Header - Example:
 *     { 'Authorization': 'Bearer <YOURTOKEN>' }
 *
 *
 * @apiParam {String} email_address Email address of the user to search
 * @apiParam {String} username Username of the user to search
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         result: [
 *             {
 *                 userId: 1,
 *                 firstName: 'John',
 *                 lastName: 'Smith',
 *                 username: 'johnsmith1'
 *             }
 *         ],
 *         'message': 'Success, user(s) found'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.get(
    '/user/search',
    passport.authenticate('bearer', {
        session: false
    }),
    getSearchUsers
);

/**
 * @api {get} /user Authenticated user details
 *
 * @apiDescription Get all details for the currently authenticated user.
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiPermission Bearer Token
 *
 * @apiHeader {Token} Authorization Your access token
 * @apiHeaderExample {json} Header - Example:
 *     { 'Authorization': 'Bearer <YOURTOKEN>' }
 *
 *
 * @apiSuccessExample {json} Success - results
 *     {
 *         'statusCode': 200,
 *         result: [
 *             {
 *                 'userId': 1,
 *                 'firstName': 'John',
 *                 'lastName': 'Smith',
 *                 'username': 'johnsmith1',
 *                 'emailAddress': 'john@smith.com',
 *                 'DOB': '12/12/1990',
 *                 'dateCreated': '2016-01-06 23:23:01.115716'
 *             }
 *         ],
 *         'message': 'Success'
 *     }
 *
 * @apiErrorExample {json} Auth Error
 *     401 Unauthorized
 *
 */
router.get(
    '/user',
    passport.authenticate('bearer', {
        session: false
    }),
    getAuthenticatedUser
);

router.get(
    '/user/authorised-apps',
    passport.authenticate('bearer', {
        session: false
    }),
    getAuthorisedApps
);

export default router;
