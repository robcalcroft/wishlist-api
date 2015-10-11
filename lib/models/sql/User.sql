CREATE TABLE "User" (
    "userId" serial NOT NULL PRIMARY KEY,
    "emailAddress" varchar(255) NOT NULL UNIQUE,
    "username" varchar(25) NOT NULL UNIQUE,
    "password" varchar(100) NOT NULL,
    "firstName" varchar(255) NOT NULL,
    "lastName" varchar(255) NOT NULL,
    "DOB" varchar(10) NOT NULL,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
