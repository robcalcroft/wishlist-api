CREATE TABLE Client (
    "applicationName" varchar(255) NOT NULL UNIQUE,
    "applicationURI" varchar(50) NOT NULL UNIQUE,
    "redirectURI" varchar(50) NOT NULL,
    "clientId" varchar(100) NOT NULL PRIMARY KEY UNIQUE,
    "clientSecret" varchar(100) NOT NULL UNIQUE,
    "userId" int REFERENCES "User" ("userId"),
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
