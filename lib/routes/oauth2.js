/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    var oauth2 = require($appRoot + "/lib/controllers/oauth2");

    /**
     * @api {get} /auth/authorize User authorization
     * @apiDescription This route is opened in a new window for the user
     * @apiGroup Authentication
     *
     * @apiParam {String} client_id Your client ID
     * @apiParam {String} response_type The response type you wish to obtain, usually <code>code</code>
     * @apiParam {String} redirect_uri The redirect URI you setup for your client
     *
     * @apiSuccessExample {json} Success
     *     GET http://example.com/callback?code=AUTHCODE
     *
     * @apiErrorExample {json} Error
     *     GET http://example.com/callback?error=access_denied
     *
     */
    app.get("/auth/authorize", oauth2.authorize);

    app.post("/auth/decision", oauth2.decison);

    /**
     * @api {post} /auth/token Obtaining a token
     * @apiDescription This route is used to obtain a token using a refresh token or an authorization code
     * @apiGroup Authentication
     *
     * @apiParam {String} client_id Your client ID
     * @apiParam {String} client_secret Your client secret
     * @apiParam {String} code Your auth code, only one of the <code>code</code> or <code>refresh_token</code> is needed
     * @apiParam {String} refresh_token Your refresh token, only one of the <code>code</code> or <code>refresh_token</code> is needed
     * @apiParam {String="authorization_code", "refresh_token"} grant_type The grant type you wish to use
     * @apiParam {String} redirect_uri The redirect URI you setup for your client
     *
     * @apiSuccessExample {json} Success - auth code grant type
     *     {
     *         "access_token": "*",
     *         "refreshToken": "*",
     *         "expires_in": "*",
     *         "grant_type": "Bearer"
     *     }
     *
     * @apiSuccessExample {json} Success - refresh token grant type
     *     {
     *         "access_token": "*",
     *         "expires_in": "*",
     *         "grant_type": "Bearer"
     *     }
     *
     * @apiErrorExample {json} Error
     *     401 Unauthorized
     *
     */
    app.post("/auth/token", oauth2.token);

};
