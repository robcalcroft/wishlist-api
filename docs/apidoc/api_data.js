define({ "api": [  {    "type": "get",    "url": "/auth/authorize",    "title": "User authorization",    "description": "<p>This route is opened in a new window for the user</p>",    "group": "Authentication",    "version": "1.0.0",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "client_id",            "description": "<p>Your client ID</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "response_type",            "description": "<p>The response type you wish to obtain, usually <code>code</code></p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "redirect_uri",            "description": "<p>The redirect URI you setup for your client</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success",          "content": "GET http://example.com/callback?code=<AUTHCODE>",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Error",          "content": "GET http://example.com/callback?error=access_denied",          "type": "json"        }      ]    },    "filename": "lib/routes/oauth2.js",    "groupTitle": "Authentication",    "name": "GetAuthAuthorize"  },  {    "type": "post",    "url": "/auth/token",    "title": "Getting a token",    "description": "<p>This route is used to obtain a token using a refresh token or an authorization code</p>",    "group": "Authentication",    "version": "1.0.0",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "client_id",            "description": "<p>Your client ID</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "client_secret",            "description": "<p>Your client secret</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "code",            "description": "<p>Your auth code, only one of the <code>code</code> or <code>refresh_token</code> is needed</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "refresh_token",            "description": "<p>Your refresh token, only one of the <code>code</code> or <code>refresh_token</code> is needed</p>"          },          {            "group": "Parameter",            "type": "String",            "allowedValues": [              "'authorization_code'",              "'refresh_token'"            ],            "optional": false,            "field": "grant_type",            "description": "<p>The grant type you wish to use</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "redirect_uri",            "description": "<p>The redirect URI you setup for your client</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success - auth code grant type",          "content": "{\n    'access_token': '<ACCESSTOKEN>',\n    'refreshToken': '<REFRESHTOKEN>',\n    'expires_in': '<EXPIRESIN>',\n    'grant_type': 'Bearer'\n}",          "type": "json"        },        {          "title": "Success - refresh token grant type",          "content": "{\n    'access_token': '<ACCESSTOKEN>',\n    'expires_in': '<EXPIRESIN>',\n    'grant_type': 'Bearer'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/oauth2.js",    "groupTitle": "Authentication",    "name": "PostAuthToken"  },  {    "type": "get",    "url": "/user",    "title": "Authenticated user details",    "description": "<p>Get all details for the currently authenticated user.</p>",    "group": "User",    "version": "1.0.0",    "permission": [      {        "name": "Bearer Token"      }    ],    "header": {      "fields": {        "Header": [          {            "group": "Header",            "type": "Token",            "optional": false,            "field": "Authorization",            "description": "<p>Your access token</p>"          }        ]      },      "examples": [        {          "title": "Header - Example:",          "content": "{ 'Authorization': 'Bearer <YOURTOKEN>' }",          "type": "json"        }      ]    },    "success": {      "examples": [        {          "title": "Success - results",          "content": "{\n    'statusCode': 200,\n    'result': [\n        {\n            'userId': 1,\n            'firstName': 'John',\n            'lastName': 'Smith',\n            'username': 'johnsmith1',\n            'emailAddress': 'john@smith.com',\n            'DOB': '12/12/1990',\n            'dateCreated': '2016-01-06 23:23:01.115716'\n        }\n    ],\n    'message': 'Success'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Auth Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/user.js",    "groupTitle": "User",    "name": "GetUser"  },  {    "type": "get",    "url": "/user/authorised-apps",    "title": "Lists authorised apps",    "description": "<p>Retrieve an application name that is authorised to access the account and a timestamp that tells the user when it was authorised.</p>",    "group": "User",    "version": "1.0.0",    "permission": [      {        "name": "Bearer Token"      }    ],    "header": {      "fields": {        "Header": [          {            "group": "Header",            "type": "Token",            "optional": false,            "field": "Authorization",            "description": "<p>Your access token</p>"          }        ]      },      "examples": [        {          "title": "Header - Example:",          "content": "{ 'Authorization': 'Bearer <YOURTOKEN>' }",          "type": "json"        }      ]    },    "success": {      "examples": [        {          "title": "Success - results",          "content": "{\n    'statusCode': 200,\n    'result': [\n        {\n            'applicationName': 'testApp',\n            'dateCreated': 'Sun Jan 24 2016 19:17:18'\n        }\n    ],\n    'message': 'Success'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Auth Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/user.js",    "groupTitle": "User",    "name": "GetUserAuthorisedApps"  },  {    "type": "get",    "url": "/user/search",    "title": "Search for users",    "description": "<p>Search based on email address or username. Email address must be in full</p>",    "group": "User",    "version": "1.0.0",    "permission": [      {        "name": "Bearer Token"      }    ],    "header": {      "fields": {        "Header": [          {            "group": "Header",            "type": "Token",            "optional": false,            "field": "Authorization",            "description": "<p>Your access token</p>"          }        ]      },      "examples": [        {          "title": "Header - Example:",          "content": "{ 'Authorization': 'Bearer <YOURTOKEN>' }",          "type": "json"        }      ]    },    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "email_address",            "description": "<p>Email address of the user to search</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "username",            "description": "<p>Username of the user to search</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success - results",          "content": "{\n    'statusCode': 200,\n    'result': [\n        {\n            'userId': 1,\n            'firstName': 'John',\n            'lastName': 'Smith',\n            'username': 'johnsmith1'\n        }\n    ],\n    'message': 'Success, user(s) found'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Auth Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/user.js",    "groupTitle": "User",    "name": "GetUserSearch"  },  {    "type": "get",    "url": "/auth/protected",    "title": "Bearer token testing",    "description": "<p>A route to allow clients to test their bearer tokens</p>",    "group": "Utilities",    "version": "1.0.0",    "permission": [      {        "name": "Bearer Token"      }    ],    "header": {      "fields": {        "Header": [          {            "group": "Header",            "type": "Token",            "optional": false,            "field": "Authorization",            "description": "<p>Your access token</p>"          }        ]      },      "examples": [        {          "title": "Header - Example:",          "content": "{ 'Authorization': 'Bearer <YOURTOKEN>' }",          "type": "json"        }      ]    },    "success": {      "examples": [        {          "title": "Success - Response:",          "content": "HTTP/1.1 200 OK\n{\n  'statusCode': 200\n  'message': 'Success'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Auth Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/utils.js",    "groupTitle": "Utilities",    "name": "GetAuthProtected"  },  {    "type": "get",    "url": "/uri-metadata",    "title": "Get metadata about a URI",    "description": "<p>Used for front-end field population for images, description etc</p>",    "group": "Utilities",    "version": "1.0.0",    "permission": [      {        "name": "Bearer Token"      }    ],    "header": {      "fields": {        "Header": [          {            "group": "Header",            "type": "Token",            "optional": false,            "field": "Authorization",            "description": "<p>Your access token</p>"          }        ]      },      "examples": [        {          "title": "Header - Example:",          "content": "{ 'Authorization': 'Bearer <YOURTOKEN>' }",          "type": "json"        }      ]    },    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "uri",            "description": "<p>The URI to grab meta data from</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success - results",          "content": "{\n    'statusCode': 200,\n    'results': [{\n        title: 'Fast Car',\n        description: 'A very fast car'.\n        image: 'http://example.com/image.png',\n        provider_name: 'Example'\n        uri: 'http://example.com/get-car-picture'\n    }],\n    'message': 'Success'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Auth Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/utils.js",    "groupTitle": "Utilities",    "name": "GetUriMetadata"  },  {    "type": "get",    "url": "/wishlist",    "title": "Get wishlist metadata",    "description": "<p>Gives metadata about each wishlist from the search. If the user id searched for is not the currently authenticated user, only publically viewable wishlists will be shown.</p>",    "group": "Wishlist",    "version": "1.0.0",    "permission": [      {        "name": "Bearer Token"      }    ],    "header": {      "fields": {        "Header": [          {            "group": "Header",            "type": "Token",            "optional": false,            "field": "Authorization",            "description": "<p>Your access token</p>"          }        ]      },      "examples": [        {          "title": "Header - Example:",          "content": "{ 'Authorization': 'Bearer <YOURTOKEN>' }",          "type": "json"        }      ]    },    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "wishlist_id",            "description": "<p>The wishlist ID to search upon</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "user_id",            "description": "<p>Grab all wishlists for the corresponding user</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "email_address",            "description": "<p>Grab all wishlists for the corresponding user</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "username",            "description": "<p>Grab all wishlists for the corresponding user</p>"          },          {            "group": "Parameter",            "type": "String",            "allowedValues": [              "'desc'",              "'asc'"            ],            "optional": true,            "field": "order",            "description": "<p>The order of the results</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success - results",          "content": "{\n    'statusCode': 200,\n    'results': [{\n        'wishlistId': 1,\n        'userId': 2,\n        'title': 'Main List',\n        'dateCreated': '2016-01-06 23:23:01.115716',\n        'isDefault': true,\n        'imageURI': 'http://image.com/image.png',\n        'privacy': 'public'\n    }],\n    'message': 'success'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Auth Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/wishlist.js",    "groupTitle": "Wishlist",    "name": "GetWishlist"  },  {    "type": "get",    "url": "/wishlist/item",    "title": "Get detailed wishlist items",    "description": "<p>Gives all entries to a wish list</p>",    "group": "Wishlist",    "version": "1.0.0",    "permission": [      {        "name": "Bearer Token"      }    ],    "header": {      "fields": {        "Header": [          {            "group": "Header",            "type": "Token",            "optional": false,            "field": "Authorization",            "description": "<p>Your access token</p>"          }        ]      },      "examples": [        {          "title": "Header - Example:",          "content": "{ 'Authorization': 'Bearer <YOURTOKEN>' }",          "type": "json"        }      ]    },    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "wishlist_id",            "description": "<p>The wishlist ID to search upon</p>"          },          {            "group": "Parameter",            "type": "Int",            "optional": true,            "field": "price_low",            "description": "<p>Price filtering between values - mandatory if companion option is specified.</p>"          },          {            "group": "Parameter",            "type": "Int",            "optional": true,            "field": "price_high",            "description": "<p>Price filtering between values - mandatory if companion option is specified.</p>"          },          {            "group": "Parameter",            "type": "Int",            "allowedValues": [              "1",              "2",              "3",              "4",              "5"            ],            "optional": true,            "field": "priority",            "description": "<p>Filter the priority of results. Multiples can be specified by a comma: priority=5,4</p>"          },          {            "group": "Parameter",            "type": "String",            "allowedValues": [              "'desc'",              "'asc'"            ],            "optional": true,            "field": "order",            "description": "<p>The order of the results</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success - results",          "content": "{\n    'statusCode': 200,\n    'results': [{\n        'userId': 1,\n        'wishlistId': 1,\n        'wishlistItemId': 4,\n        'title': 'iPhone 5',\n        'description': 'Good-ish phone',\n        'sourceURI': 'http://www.amazon.co.uk/gp/product/B0117RGG8E/ref=s9_simh_gw_p23_d0_i1?pf_rd_m=A3P5ROKL5A1OLE&pf_rd_s=desktop-1&pf_rd_r=06WRCG8HYERKXBE7XX2A&pf_rd_t=36701&pf_rd_p=577047927&pf_rd_i=desktop',\n        'sourceName': 'Amazon',\n        'imageURI': 'https://www.drupal.org/files/issues/header_1.png',\n        'price': 50,\n        'priceCurrency': 'stirling',\n        'priceCurrencySymbol': '£',\n        'userPriority': 3,\n        'dateCreated': '2016-01-13T20:25:46.939Z'\n    }],\n    'message': 'success'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Auth Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/wishlist.js",    "groupTitle": "Wishlist",    "name": "GetWishlistItem"  },  {    "type": "post",    "url": "/wishlist",    "title": "Create new wishlist",    "description": "<p>Creates a new wishlist for the authenticated user</p>",    "group": "Wishlist",    "version": "1.0.0",    "permission": [      {        "name": "Bearer Token"      }    ],    "header": {      "fields": {        "Header": [          {            "group": "Header",            "type": "Token",            "optional": false,            "field": "Authorization",            "description": "<p>Your access token</p>"          }        ]      },      "examples": [        {          "title": "Header - Example:",          "content": "{ 'Authorization': 'Bearer <YOURTOKEN>' }",          "type": "json"        }      ]    },    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "title",            "description": "<p>The title of the wishlist</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": true,            "field": "is_default",            "description": "<p>Set the wishlist as the default wishlist for the user A header image for the list</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": true,            "field": "image_uri",            "description": "<p>A header image for the list</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": true,            "field": "privacy",            "defaultValue": "public",            "description": "<p>The visibility of the wishlist to other users</p>"          }        ]      }    },    "success": {      "examples": [        {          "title": "Success - results",          "content": "{\n    'statusCode': 200,\n    'message': 'Wishlist successfully created'\n}",          "type": "json"        }      ]    },    "error": {      "examples": [        {          "title": "Auth Error",          "content": "401 Unauthorized",          "type": "json"        }      ]    },    "filename": "lib/routes/wishlist.js",    "groupTitle": "Wishlist",    "name": "PostWishlist"  }] });
