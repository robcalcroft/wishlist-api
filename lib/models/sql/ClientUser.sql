CREATE TABLE ClientUser (
    "clientId" varchar(100) REFERENCES "Client" ("clientId"),
    "userId" int REFERENCES "User" ("userId"),
    "dateCreated" timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("clientId", "userId")
);
