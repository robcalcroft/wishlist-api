INSERT INTO "Client" (
    "applicationName",
    "redirectURI",
    "applicationURI",
    "clientId",
    "clientSecret"
)
VALUES (
    'testApp',
    'http://localhost:8001/callback',
    'http://www.testapp.com',
    'f6effb0a6eaf48daf2e9588d76733592',
    -- Broqka1mzxtrwigGA-98hBk0v7ABsQozV.TvyrKtm3nOnpUCm0RMqj9pRf.ctC8X81ac5PLLbszIp4cD5Jeua066c2UfQq665kL6
    '$2a$08$c6GjZdKGkprTwIZThXE5/uKvnARQnFpk4LaOHdJwxuKJMebC0iycW'
), (
    'Offical Wishlist Client',
    'http://wishlist.pw/callback',
    'http://wihslist.pw',
    '1b008ffce1e40ed2a9af3c584d363784',
    -- -5HbBcdVplM-RC~us4SoSr2gqh6A9ggmuLzEVPnvauFxeYAMvWt_1TOUmAtptYPwwgPJPbdizQ0
    '$2a$08$RcLk4.CLnl9XFtBPQg646u0yeHXMwA0JroO871zmu.mTGzRnyaeMq'
);
