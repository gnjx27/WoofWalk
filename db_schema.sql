PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
    userId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hashedPassword TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
    phoneNumber TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    registerDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accountType TEXT NOT NULL CHECK(accountType IN ('dogOwner', 'dogWalker'))
);

CREATE TABLE IF NOT EXISTS reviews (
    reviewId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 0 AND 5),
    comment TEXT NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (userId)
);

CREATE TABLE IF NOT EXISTS dogs (
    dogId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    dogName TEXT NOT NULL,
    dogBreed TEXT NOT NULL,
    dogAge INTEGER NOT NULL CHECK(dogAge BETWEEN 0 AND 30),
    dogSize TEXT NOT NULL check(dogSize IN ('small', 'medium', 'large')),
    userId INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (userId)
);

CREATE TABLE IF NOT EXISTS bookings (
    bookingId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    dogId INTEGER NOT NULL,
    dogOwnerId INTEGER NOT NULL,
    dogWalkerId INTEGER NOT NULL,
    dateTime DATETIME NOT NULL,
    remarks TEXT DEFAULT "No remarks",
    duration INT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    paymentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    dogOwnerId INTEGER NOT NULL,
    dogWalkerId INTEGER NOT NULL,
    amount TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'complete'))
);

------- INSERT -------

INSERT INTO users (
    name, 
    email, 
    hashedPassword, 
    age, 
    gender, 
    phoneNumber, 
    address, 
    accountType
) VALUES (
    "Gerald",
    "gerald@gmail.com",
    "123",
    23,
    "male",
    "94513931",
    "520134 Simei Stree 1 Block 134 #05-162",
    "dogOwner"
);

INSERT INTO reviews (
    rating,
    comment,
    userId
) VALUES (
    5,
    "good dog owner",
    1
);

INSERT INTO dogs (
    dogName,
    dogBreed,
    dogAge,
    dogSize,
    userId
) VALUES (
    "Brian",
    "Labrador",
    15,
    "medium",
    1
);

INSERT INTO bookings (
    dogId,
    dogOwnerId,
    dogWalkerId,
    dateTime,
    remarks,
    duration
) VALUES (
    1,
    1,
    2,
    CURRENT_TIMESTAMP,
    "walk slowly",
    2
);

INSERT INTO payments (
    dogOwnerId,
    dogWalkerId,
    amount,
    paymentMethod,
    status
) VALUES (
    1,
    2,
    "200.00",
    "PAYNOW",
    "pending"
);

COMMIT