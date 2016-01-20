CREATE TABLE "Client" (
    "userId" int NOT NULL REFERENCES "User" ("userId"),
    "applicationName" varchar(255) NOT NULL UNIQUE,
    "applicationURL" varchar(50) NOT NULL UNIQUE,
    "redirectURI" varchar(50) NOT NULL,
    "clientId" varchar(100) NOT NULL PRIMARY KEY UNIQUE,
    "clientSecret" varchar(100) NOT NULL UNIQUE,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
