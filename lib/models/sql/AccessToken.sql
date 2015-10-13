CREATE TABLE "AccessToken" (
    "accessToken" varchar(100) NOT NULL UNIQUE PRIMARY KEY,
    "clientId" varchar(100) REFERENCES "Client" ("clientId"),
    "userId" int REFERENCES "User" ("userId"),
    "expiry" int NOT NULL,
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
