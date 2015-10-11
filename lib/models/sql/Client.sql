CREATE TABLE "Client" (
    "applicationName" varchar(255) NOT NULL UNIQUE,
    "applicationURL" varchar(25) NOT NULL UNIQUE,
    "redirectURI" varchar(25) NOT NULL,
    "clientId" varchar(100) NOT NULL PRIMARY KEY UNIQUE,
    "clientSecret" varchar(100) NOT NULL UNIQUE,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
