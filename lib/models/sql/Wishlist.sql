CREATE TABLE Wishlist (
    "userId" int REFERENCES "User" ("userId"),
    "wishlistId" integer PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE ,
    "title" varchar(100) NOT NULL,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP,
    "isDefault" boolean NOT NULL,
    "imageURI" varchar(500),
    "privacy" varchar(100) NOT NULL,
    CONSTRAINT chk_privacy CHECK (privacy IN ('public', 'private'))
);
