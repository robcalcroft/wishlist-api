CREATE TABLE "WishlistItem" (
    "userId" int REFERENCES "User" ("userId"),
    "wishlistId" int REFERENCES "Wishlist" ("wishlistId"),
    "wishlistItemId" serial NOT NULL UNIQUE PRIMARY KEY,
    "title" varchar(100) NOT NULL,
    "description" varchar(500),
    "sourceURI" varchar(2000) NOT NULL,
    "sourceName" varchar(500),
    "imageURI" varchar(500),
    "price" int,
    "priceCurrency" varchar(500),
    "priceCurrencySymbol" varchar(500),
    "userPriority" int,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
