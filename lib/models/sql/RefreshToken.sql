CREATE TABLE "RefreshToken" (
    "refreshToken" varchar(300) NOT NULL UNIQUE PRIMARY KEY,
    "clientId" varchar(100) REFERENCES "Client" ("clientId"),
    "userId" int REFERENCES "User" ("userId"),
    "created" int NOT NULL
);
