CREATE TABLE "Wishlist" (
    "userId" int REFERENCES "User" ("userId"),
    "wishlistId" serial NOT NULL UNIQUE,
    "title" varchar(100) NOT NULL UNIQUE,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP,
    "isDefault" boolean NOT NULL,
    "imageURI" varchar(500)
);
