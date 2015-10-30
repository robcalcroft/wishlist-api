# OAuth2 Flow
This guide describes the OAuth2 flow for OAuth2 authentication with Wishlist and is supported by the 'Authentication' section of the API docs.

#### Getting permission from the user
Open the following in a dialog box.
```
GET http://example.com/auth/authorize?client_id=*&response_type=code&redirect_uri=*
```
The user will be asked to log in (if they aren't already), and will be presented with the option to accept or deny your request for permission. If they confirm, you'll receive an authorization code.

#### Obtaining a token
Tokens are given in exchange for your authorization code - your authorization code will be redundant after using it to obtain a token.

Your `access_token` can be used to access protected resources relating to the authenticated user, and will expire after the stated time in the response. The `refresh_token` is only used for re-obtaining access tokens and will not expire until the user revokes access to your application. If your `access_token` expires and access to protected resources is still required, the `refresh_token` can be used to obtain a new `access_token` in a similar fashion to the original token request.

Now you'll receive a similar response to the auth code request but there will be no refresh token.

**Please see API documentation for technical data**
