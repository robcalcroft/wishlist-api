# Wishlist Public API Docs v1.0.0

A vendor agnostic wishlist creator

- [Authentication](#authentication)
	- [User authorization](#user-authorization)
	- [Obtaining a token](#obtaining-a-token)
	
- [Utilities](#utilities)
	- [Bearer token testing](#bearer-token-testing)
	- [Obtain metadata about a URI](#obtain-metadata-about-a-uri)
	
- [Wishlist](#wishlist)
	- [Obtain wishlist metadata](#obtain-wishlist-metadata)
	- [Obtain detailed wishlist items](#obtain-detailed-wishlist-items)
	- [Create new wishlist for user](#create-new-wishlist-for-user)
	


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
# Utilities

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
  'statusCode': 200
  'message': 'Success'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```
## Obtain metadata about a URI

<p>Used for front-end field population for images, description etc</p> 

	GET /uri-metadata

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p> 							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| uri			| <p>String</p> 			|  <p>The URL to grab meta data from</p> 							|

### Success Response

Success - results

```
{
    'statusCode': 200,
    'results': [{
        title: 'Fast Car',
        description: 'A very fast car'.
        image: 'http://example.com/image.png',
        provider_name: 'Example'
        uri: 'http://example.com/get-car-picture'
    }],
    'message': 'Success'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```
# Wishlist

## Obtain wishlist metadata

<p>Gives metadata about each wishlist from the search</p> 

	GET /wishlist

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p> 							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| wishlist_id			| <p>String</p> 			|  <p>The wishlist ID to search upon</p> 							|
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
## Obtain detailed wishlist items

<p>Gives all entries to a wish list</p> 

	GET /wishlist/item

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p> 							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| wishlist_id			| <p>String</p> 			|  <p>The wishlist ID to search upon</p> 							|
| price_low			| <p>Int</p> 			| **optional** <p>Price filtering between values - mandatory if companion option is specified.</p> 							|
| price_high			| <p>Int</p> 			| **optional** <p>Price filtering between values - mandatory if companion option is specified.</p> 							|
| priority			| <p>Int</p> 			| **optional** <p>Filter the priority of results. Multiples can be specified by a comma: priority=5,4</p> 							|
| order			| <p>String</p> 			| **optional** <p>The order of the results</p> 							|

### Success Response

Success - results

```
{
    'statusCode': 200,
    'results': [{
        'userId': 1,
        'wishlistId': 1,
        'wishlistItemId': 4,
        'title': 'iPhone 5',
        'description': 'Good-ish phone',
        'sourceURI': 'http://www.amazon.co.uk/gp/product/B0117RGG8E/ref=s9_simh_gw_p23_d0_i1?pf_rd_m=A3P5ROKL5A1OLE&pf_rd_s=desktop-1&pf_rd_r=06WRCG8HYERKXBE7XX2A&pf_rd_t=36701&pf_rd_p=577047927&pf_rd_i=desktop',
        'sourceName': 'Amazon',
        'imageURI': 'https://www.drupal.org/files/issues/header_1.png',
        'price': 50,
        'priceCurrency': 'stirling',
        'priceCurrencySymbol': '£',
        'userPriority': 3,
        'dateCreated': '2016-01-13T20:25:46.939Z'
    }],
    'message': 'success'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```
## Create new wishlist for user

<p>Creates a new wishlist for the user with details</p> 

	POST /wishlist

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p> 							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| user_id			| <p>String</p> 			|  <p>The user id to add the wishlist to TODO Make it restricted to req.user</p> 							|
| title			| <p>String</p> 			|  <p>The title of the wishlist</p> 							|
| is_default			| <p>String</p> 			| **optional** <p>Set the wishlist as the default wishlist for the user A header image for the list</p> 							|
| image_uri			| <p>String</p> 			| **optional** <p>A header image for the list</p> 							|

### Success Response

Success - results

```
{
    'statusCode': 200,
    'message': 'Wishlist successfully added'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```

