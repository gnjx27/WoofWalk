PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    user_photo TEXT NOT NULL DEFAULT 'No photo',
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK(account_type IN('owner', 'walker')),
    has_owner_profile BOOLEAN DEFAULT FALSE,
    has_walker_profile BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS walker (
    walker_id INTEGER PRIMARY KEY AUTOINCREMENT,
    walker_quote TEXT DEFAULT "Let me walk your dog!",
    walker_bio TEXT DEFAULT "No bio added...",
    walker_skills TEXT DEFAULT "No skills added...",
    walker_contact TEXT DEFAULT "12345678",
    base_price TEXT DEFAULT "20",
    walker_location TEXT DEFAULT "Singapore",
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id)
);

CREATE TABLE IF NOT EXISTS dog (
    dog_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dog_name TEXT DEFAULT 'Not added',
    dog_breed TEXT DEFAULT 'Not added',
    dog_age TEXT NOT NULL DEFAULT 'Not added' CHECK(dog_age IN('Puppy', 'Adult', 'Senior', 'Not added')),
    dog_size TEXT NOT NULL DEFAULT 'Not added' CHECK(dog_size IN('S', 'M', 'L', 'XL', 'Not added')),
    special_needs TEXT DEFAULT 'No special need',
    dog_remark TEXT DEFAULT 'No remark',
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id)
);

CREATE TABLE IF NOT EXISTS review (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewer_name TEXT NOT NULL,
    star_rating INTEGER NOT NULL CHECK(star_rating BETWEEN 1 AND 5),
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
    walk_date DATE NOT NULL,
    walk_time TIME NOT NULL,
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

-- INSERT USER (WALKERS) --
INSERT INTO user (username, email, password_hash, account_type)
VALUES 
    ('walker1', 'john@gmail.com', '$2b$10$WO4vjXeqEREDftX7SsaUC.fVPyH0BulMCy5jGXBtDYkAGYvUaQNKC', 'walker'),
    ('walker2', 'bob@gmail.com', '$2b$10$WO4vjXeqEREDftX7SsaUC.fVPyH0BulMCy5jGXBtDYkAGYvUaQNKC', 'walker'),
    ('walker3', 'frank@gmail.com', '$2b$10$WO4vjXeqEREDftX7SsaUC.fVPyH0BulMCy5jGXBtDYkAGYvUaQNKC', 'walker');

-- INSERT WALKER --
INSERT INTO walker (user_id)
VALUES
    (1),
    (2),
    (3);

-- INSERT WALKER REVIEWS --
INSERT INTO review (reviewer_name, star_rating, review, walker_id)
VALUES 
    ('owner1', 5, 'Good dog walker!', 1),
    ('owner2', 5, 'Good dog walker!', 1),
    ('owner3', 5, 'Good dog walker!', 1),
    ('owner4', 4, 'Good dog walker!', 2),
    ('owner5', 4, 'Good dog walker!', 2),
    ('owner6', 2, 'Good dog walker!', 3);

COMMIT;