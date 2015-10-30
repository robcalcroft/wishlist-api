# OAuth2 Flow
This guide describes the OAuth2 flow for OAuth2 authentication with Wishlist.

#### Get permission from the user
Open the following in a dialog box.
```
GET http://example.com/auth/authorize?client_id=*&response_type=code&redirect_uri=*
```
The user will be asked to log in (if they aren't already), and will be presented with the option to accept or deny your request for permission. If they accept your redirect URI will be called like so:
```
GET http://example.com/callback?code=*
```
This is your authorization code, you will use it to exchange for a token.

If they deny, your redirect URI will be called like so:
```
GET http://example.com/callback?error=access_denied
```
#### Obtain a token
Tokens are given in exchange for your authorization code - your authorization code will be redundant after using it to obtain a token.

Make a request to the following URL:
```
POST http://api.example.com/auth/token
```
The body of the request can be either `application/json` or `x-www-form-urlencoded`, the former is recommended.
```json
{
    "client_id": "*",
    "client_secret": "*",
    "code": "YOUR AUTHORIZATION CODE",
    "grant_type": "authorization_code",
    "redirect_uri": "*"
}
```
If your details are accepted, you will receive the following response:
```json
{
    "access_token": "*",
    "refreshToken": "*",
    "expires_in": "*",
    "grant_type": "Bearer"
}
```
Your `access_token` can be used to access protected resources relating to the authenticated user, and will expire after the stated time in the response. The `refresh_token` is only used for re-obtaining access tokens and will not expire until the user revokes access to your application. If your `access_token` expires and access to protected resources is still required, the `refresh_token` can be used to obtain a new `access_token` in a similar fashion to the original token request:
```json
{
    "client_id": "*",
    "client_secret": "*",
    "refresh_token": "YOUR REFRESH TOKEN",
    "grant_type": "refresh_token",
    "redirect_uri": "*"
}
```
Now you'll receive a similar response to the auth code request but there will be no refresh token.
