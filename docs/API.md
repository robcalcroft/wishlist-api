# Wishlist Public API Docs v1.0.0

A vendor agnostic wishlist creator

- [Authentication](#authentication)
	- [User authorization](#user-authorization)
	- [Getting a token](#getting-a-token)
	
- [User](#user)
	- [Authenticated user details](#authenticated-user-details)
	- [Lists authorised apps](#lists-authorised-apps)
	- [Search for users](#search-for-users)
	
- [Utilities](#utilities)
	- [Bearer token testing](#bearer-token-testing)
	- [Get metadata about a URI](#get-metadata-about-a-uri)
	
- [Wishlist](#wishlist)
	- [Get wishlist metadata](#get-wishlist-metadata)
	- [Get detailed wishlist items](#get-detailed-wishlist-items)
	- [Create new wishlist](#create-new-wishlist)
	


# Authentication

## User authorization

<p>This route is opened in a new window for the user</p>

	GET /auth/authorize


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| client_id			| String			|  <p>Your client ID</p>							|
| response_type			| String			|  <p>The response type you wish to obtain, usually <code>code</code></p>							|
| redirect_uri			| String			|  <p>The redirect URI you setup for your client</p>							|

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
## Getting a token

<p>This route is used to obtain a token using a refresh token or an authorization code</p>

	POST /auth/token


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| client_id			| String			|  <p>Your client ID</p>							|
| client_secret			| String			|  <p>Your client secret</p>							|
| code			| String			|  <p>Your auth code, only one of the <code>code</code> or <code>refresh_token</code> is needed</p>							|
| refresh_token			| String			|  <p>Your refresh token, only one of the <code>code</code> or <code>refresh_token</code> is needed</p>							|
| grant_type			| String			|  <p>The grant type you wish to use</p>							|
| redirect_uri			| String			|  <p>The redirect URI you setup for your client</p>							|

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
# User

## Authenticated user details

<p>Get all details for the currently authenticated user.</p>

	GET /user

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p>							|

### Success Response

Success - results

```
{
    'statusCode': 200,
    'result': [
        {
            'userId': 1,
            'firstName': 'John',
            'lastName': 'Smith',
            'username': 'johnsmith1',
            'emailAddress': 'john@smith.com',
            'DOB': '12/12/1990',
            'dateCreated': '2016-01-06 23:23:01.115716'
        }
    ],
    'message': 'Success'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```
## Lists authorised apps

<p>Retrieve an application name that is authorised to access the account and a timestamp that tells the user when it was authorised.</p>

	GET /user/authorised-apps

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p>							|

### Success Response

Success - results

```
{
    'statusCode': 200,
    'result': [
        {
            'applicationName': 'testApp',
            'dateCreated': 'Sun Jan 24 2016 19:17:18'
        }
    ],
    'message': 'Success'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```
## Search for users

<p>Search based on email address or username. Email address must be in full</p>

	GET /user/search

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| email_address			| String			|  <p>Email address of the user to search</p>							|
| username			| String			|  <p>Username of the user to search</p>							|

### Success Response

Success - results

```
{
    'statusCode': 200,
    'result': [
        {
            'userId': 1,
            'firstName': 'John',
            'lastName': 'Smith',
            'username': 'johnsmith1'
        }
    ],
    'message': 'Success, user(s) found'
}
```
### Error Response

Auth Error

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
| Authorization			| Token			|  <p>Your access token</p>							|

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
## Get metadata about a URI

<p>Used for front-end field population for images, description etc</p>

	GET /uri-metadata

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| uri			| String			|  <p>The URI to grab meta data from</p>							|

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

## Get wishlist metadata

<p>Gives metadata about each wishlist from the search. If the user id searched for is not the currently authenticated user, only publically viewable wishlists will be shown.</p>

	GET /wishlist

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| wishlist_id			| String			|  <p>The wishlist ID to search upon</p>							|
| user_id			| String			|  <p>Grab all wishlists for the corresponding user</p>							|
| email_address			| String			|  <p>Grab all wishlists for the corresponding user</p>							|
| username			| String			|  <p>Grab all wishlists for the corresponding user</p>							|
| order			| String			| **optional** <p>The order of the results</p>							|

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
        'imageURI': 'http://image.com/image.png',
        'privacy': 'public'
    }],
    'message': 'success'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```
## Get detailed wishlist items

<p>Gives all entries to a wish list</p>

	GET /wishlist/item

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| wishlist_id			| String			|  <p>The wishlist ID to search upon</p>							|
| price_low			| Int			| **optional** <p>Price filtering between values - mandatory if companion option is specified.</p>							|
| price_high			| Int			| **optional** <p>Price filtering between values - mandatory if companion option is specified.</p>							|
| priority			| Int			| **optional** <p>Filter the priority of results. Multiples can be specified by a comma: priority=5,4</p>							|
| order			| String			| **optional** <p>The order of the results</p>							|

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
## Create new wishlist

<p>Creates a new wishlist for the authenticated user</p>

	POST /wishlist

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| Token			|  <p>Your access token</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| title			| String			|  <p>The title of the wishlist</p>							|
| is_default			| String			| **optional** <p>Set the wishlist as the default wishlist for the user A header image for the list</p>							|
| image_uri			| String			| **optional** <p>A header image for the list</p>							|
| privacy			| String			| **optional** <p>The visibility of the wishlist to other users</p>							|

### Success Response

Success - results

```
{
    'statusCode': 200,
    'message': 'Wishlist successfully created'
}
```
### Error Response

Auth Error

```
401 Unauthorized
```

