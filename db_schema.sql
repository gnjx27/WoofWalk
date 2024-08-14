PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL UNIQUE,
    account_type TEXT NOT NULL CHECK(account_type IN('owner', 'walker')),
    has_owner_profile BOOLEAN DEFAULT FALSE,
    has_walker_profile BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS walker (
    walker_id INTEGER PRIMARY KEY AUTOINCREMENT,
    walker_photo TEXT NOT NULL DEFAULT "No photo",
    walker_quote TEXT DEFAULT "Let me walk your dog!",
    walker_bio TEXT DEFAULT "No bio added...",
    walker_skills TEXT DEFAULT "No skills added...",
    walker_contact TEXT DEFAULT "+65 9006 1234",
    base_price TEXT DEFAULT "20",
    walker_location TEXT DEFAULT "Singapore",
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id)
);



CREATE TABLE IF NOT EXISTS dog (
    dog_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dog_name TEXT NOT NULL,
    dog_breed TEXT NOT NULL,
    dog_age INTEGER NOT NULL CHECK(dog_age BETWEEN 1 AND 30),
    dog_size TEXT NOT NULL CHECK(dog_size IN('S', 'M', 'L', 'XL')),
    dog_gender TEXT NOT NULL CHECK(dog_gender IN('male', 'female')),
    dog_photo TEXT NOT NULL,
    special_needs TEXT DEFAULT 'No special needs',
    favourite_activities TEXT DEFAULT 'Going for walks!',
    behavioural_notes TEXT DEFAULT 'No behavioural notes',
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id)
);

CREATE TABLE IF NOT EXISTS review (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    review TEXT NOT NULL,
    review_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    walker_id INTEGER NOT NULL,
    FOREIGN KEY (walker_id) REFERENCES walker (walker_id)
);

CREATE TABLE IF NOT EXISTS booking (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dog_id INTEGER NOT NULL,
    booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    walk_location TEXT NOT NULL,
    walk_datetime DATETIME NOT NULL,
    duration TEXT NOT NULL,
    remarks TEXT DEFAULT "No remarks",
    walk_status TEXT NOT NULL CHECK(walk_status IN('pending', 'complete')),
    user_id INTEGER NOT NULL,
    walker_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id),
    FOREIGN KEY (walker_id) REFERENCES walker (walker_id)
);

CREATE TABLE IF NOT EXISTS payment (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount TEXT NOT NULL,
    extended_walk_charge TEXT NOT NULL DEFAULT "No extra charges",
    total_amount TEXT NOT NULL,
    payment_date DATE NOT NULL,
    payment_status TEXT NOT NULL CHECK(payment_status IN('pending', 'complete')),
    user_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id),
    FOREIGN KEY (booking_id) REFERENCES booking (booking_id)
);


CREATE TABLE IF NOT EXISTS owner (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_location TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id)
);

COMMIT
