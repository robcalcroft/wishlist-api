CREATE TABLE "Wishlist" (
    "userId" int REFERENCES "User" ("userId"),
    "wishlistId" serial NOT NULL UNIQUE,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP,
    "isDefault" boolean NOT NULL,
    "imageURI" varchar(255)
);
