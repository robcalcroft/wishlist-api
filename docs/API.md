# Wishlist Public API Docs v0.0.0

A vendor agnostic wishlist creator

- [Authentication](#authentication)
	- [User authorization](#user-authorization)
	- [Bearer token testing](#bearer-token-testing)
	- [Obtaining a token](#obtaining-a-token)
	
- [Wishlist](#wishlist)
	- [Obtain wishlist metadata](#obtain-wishlist-metadata)
	


# Authentication

## User authorization

<p>This route is opened in a new window for the user</p> 

	GET /auth/authorize


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| client_id			| <p>String</p> 			|  <p>Your client ID</p> 							|
| response_type			| <p>String</p> 			|  <p>The response type you wish to obtain, usually <code>code</code></p> 							|
| redirect_uri			| <p>String</p> 			|  <p>The redirect URI you setup for your client</p> 							|

### Success Response

Success

```
GET http://example.com/callback?code=<AUTHCODE>
```
### Error Response

Error

```
GET http://example.com/callback?error=access_denied
```
## Bearer token testing

<p>A route to allow clients to test their bearer tokens</p> 

	GET /auth/protected

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p> 							|

### Success Response

Success - Response:

```
HTTP/1.1 200 OK
{
  'success': 'true'
}
```
## Obtaining a token

<p>This route is used to obtain a token using a refresh token or an authorization code</p> 

	POST /auth/token


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| client_id			| <p>String</p> 			|  <p>Your client ID</p> 							|
| client_secret			| <p>String</p> 			|  <p>Your client secret</p> 							|
| code			| <p>String</p> 			|  <p>Your auth code, only one of the <code>code</code> or <code>refresh_token</code> is needed</p> 							|
| refresh_token			| <p>String</p> 			|  <p>Your refresh token, only one of the <code>code</code> or <code>refresh_token</code> is needed</p> 							|
| grant_type			| <p>String</p> 			|  <p>The grant type you wish to use</p> 							|
| redirect_uri			| <p>String</p> 			|  <p>The redirect URI you setup for your client</p> 							|

### Success Response

Success - auth code grant type

```
{
    'access_token': '<ACCESSTOKEN>',
    'refreshToken': '<REFRESHTOKEN>',
    'expires_in': '<EXPIRESIN>',
    'grant_type': 'Bearer'
}
```
Success - refresh token grant type

```
{
    'access_token': '<ACCESSTOKEN>',
    'expires_in': '<EXPIRESIN>',
    'grant_type': 'Bearer'
}
```
### Error Response

Error

```
401 Unauthorized
```
# Wishlist

## Obtain wishlist metadata

<p>Gives metadata about each wishlist from the search</p> 

	GET /wishlist


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| <p>String</p> 			|  <p>The wishlist ID to search upon</p> 							|
| user_id			| <p>String</p> 			|  <p>Grab all wishlists for the corresponding user</p> 							|
| order			| <p>String</p> 			| **optional** <p>The order of the results</p> 							|

### Success Response

Success - results

```
{
    'statusCode': 200,
    'results': [{
        'wishlistId': 1,
        'userId': 2,
        'title': 'Main List',
        'dateCreated': '2016-01-06 23:23:01.115716',
        'isDefault': true,
        'imageURI': 'http://image.com/image.png'
    }],
    'message': 'success'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```

