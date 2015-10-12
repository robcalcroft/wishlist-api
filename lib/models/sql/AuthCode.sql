CREATE TABLE "AuthCode" (
    "authCode" varchar(100) NOT NULL UNIQUE PRIMARY KEY,
    "clientId" varchar(100) REFERENCES "Client" ("clientId"),
    "userId" int REFERENCES "User" ("userId"),
    "redirectURI" varchar(255) NOT NULL,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
