PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL UNIQUE,
    account_type TEXT NOT NULL CHECK(account_type IN('owner', 'walker'))
);

CREATE TABLE IF NOT EXISTS dog (
    dog_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dog_name TEXT NOT NULL,
    dog_breed TEXT NOT NULL,
    dog_age INTEGER NOT NULL CHECK(dog_age BETWEEN 1 AND 30),
    dog_size TEXT NOT NULL CHECK(dog_size IN("S", "M", "L", "XL")),
    dog_gender TEXT NOT NULL CHECK(dog_gender IN("male", "female")),
    dog_photo TEXT NOT NULL,
    special_needs TEXT DEFAULT "No special needs",
    favourite_activities TEXT DEFAULT "Going for walks!",
    behavioural_notes TEXT DEFAULT "No behavioural notes",
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id)
);

CREATE TABLE IF NOT EXISTS walker (
    walker_id INTEGER PRIMARY KEY AUTOINCREMENT,
    walker_photo TEXT NOT NULL,
    walker_quote TEXT DEFAULT "Let me walk your dog!",
    walker_bio TEXT DEFAULT "No bio",
    walker_skills TEXT DEFAULT "Dog walking",
    walker_contact TEXT NOT NULL,
    base_price TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id)
);

CREATE TABLE IF NOT EXISTS review (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    review TEXT NOT NULL,
    review_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    walker_id INTEGER NOT NULL,
    FOREIGN KEY (walker_id) REFERENCES walker (walker_id)
);

---insert---
INSERT INTO user (username, email, password_hash, account_type) VALUES (
    "user1",
    "user1@gmail.com",
    "123",
    "owner"
);

INSERT INTO user (username, email, password_hash, account_type) VALUES (
    "user2",
    "user2@gmail.com",
    "456",
    "walker"
);

INSERT INTO dog (
    dog_name,
    dog_breed,
    dog_age,
    dog_size,
    dog_gender,
    dog_photo,
    special_needs,
    favourite_activities,
    behavioural_notes,
    user_id
) VALUES (
    "brian",
    "labrador",
    12,
    "M",
    "male",
    "no photo",
    "no special needs",
    "no favourite activities",
    "no behavourial notes",
    1
);

INSERT INTO walker (
    walker_photo,
    walker_quote,
    walker_bio,
    walker_skills,
    walker_contact,
    base_price,
    user_id
) VALUES (
    "no photo",
    "no quote",
    "no bio",
    "no walker skills",
    "1233455678",
    "$50.00",
    2
);

INSERT INTO review (
    rating,
    review,
    walker_id
) VALUES (
    4,
    "good walker",
    1
);


COMMIT