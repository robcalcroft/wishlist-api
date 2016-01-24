CREATE TABLE "Wishlist" (
    "userId" int REFERENCES "User" ("userId"),
    "wishlistId" serial NOT NULL UNIQUE PRIMARY KEY,
    "title" varchar(100) NOT NULL UNIQUE,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP,
    "isDefault" boolean NOT NULL,
    "imageURI" varchar(500),
    "privacy" varchar(100) NOT NULL,
    CONSTRAINT chk_privacy CHECK (privacy IN ('public', 'private'))
);
