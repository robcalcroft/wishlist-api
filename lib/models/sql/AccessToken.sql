CREATE TABLE "AccessToken" (
    "accessToken" varchar(100) NOT NULL UNIQUE,
    "clientId" varchar(100) REFERENCES "Client" ("clientId"),
    "userId" varchar(100) REFERENCES "User" ("userId"),
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
