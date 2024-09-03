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
    amount INTEGER NOT NULL,
    extended_walk_charge INTEGER NOT NULL DEFAULT "No extra charges",
    total_amount INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    payment_status TEXT NOT NULL CHECK(payment_status IN('pending', 'complete')),
    user_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (user_id),
    FOREIGN KEY (booking_id) REFERENCES booking (booking_id)
);

-- inserting dummy walker user profiles --
INSERT INTO user (username, email, password_hash, account_type)
VALUES 
    ('Alice', 'alice@gmail.com', '$2b$10$WO4vjXeqEREDftX7SsaUC.fVPyH0BulMCy5jGXBtDYkAGYvUaQNKC', 'walker'),
    ('Bruce', 'bruce@gmail.com', '$2b$10$WO4vjXeqEREDftX7SsaUC.fVPyH0BulMCy5jGXBtDYkAGYvUaQNKC', 'walker'),
    ('Charlie', 'charlie@gmail.com', '$2b$10$WO4vjXeqEREDftX7SsaUC.fVPyH0BulMCy5jGXBtDYkAGYvUaQNKC', 'walker'),
    ('Daisy', 'daisy@gmail.com', '$2b$10$WO4vjXeqEREDftX7SsaUC.fVPyH0BulMCy5jGXBtDYkAGYvUaQNKC', 'walker'),
    ('Elizabeth', 'elizabeth@gmail.com', '$2b$10$WO4vjXeqEREDftX7SsaUC.fVPyH0BulMCy5jGXBtDYkAGYvUaQNKC', 'walker');

-- inserting dummy walker data -- 
INSERT INTO walker (
    walker_quote,
    walker_bio,
    walker_skills,
    walker_contact,
    base_price,
    walker_location,
    user_id
)
VALUES
    (
        'Your dog''s happiness, my priority.',
        'Hi there! I''m Alice, and I''m absolutely passionate about dogs. With over 7 years of experience in dog walking and pet care, I''ve had the joy of meeting and caring for dogs of all shapes and sizes. From energetic pups who love a good game of fetch to older dogs who enjoy a leisurely stroll, I tailor each walk to suit their needs and personality. Your furry companion''s happiness and well-being are my top priorities, and I can''t wait to create paw-some memories with them!',
        'Dog walking, Obedience training',
        '98765432',
        '25',
        'Jurong East, Singapore',
        1
    ),
    (
        'Every wag tells a story!',
        'Hello! I''m Bruce, a dedicated dog walker with over 5 years of experience. I believe in the unique bond between dogs and their owners, and I''m here to strengthen that bond through fun and engaging walks. Whether your dog is a high-energy runner or a laid-back walker, I customize each session to fit their needs. Let''s make every walk an adventure your dog will love!',
        'Dog walking, Behavioral training',
        '91234567',
        '22',
        'Orchard Road, Singapore',
        2
    ),
    (
        'Walking with dogs is not just a job; it''s a joy and a privilege.',
        'Greetings! I am Charlie with 6 years in dog walking and a lifelong love for pets, I provide a personalized walking experience for each furry friend. From playful pups to gentle seniors, I ensure every walk is both enjoyable and beneficial. My goal is to make each walk a delightful experience for your dog and to foster a positive relationship between us.',
        'Dog walking, Pet sitting',
        '99876543',
        '28',
        'Bugis, Singapore',
        3
    ),
    (
        'Let''s explore the world one paw at a time!',
        'Daisy here!, and I am thrilled to offer my dog walking services. With a background in pet care and a passion for animals, I ensure that every walk is an adventure. My approach is to understand each dog''s personality and needs to provide a tailored walking experience. Whether it''s a brisk run or a relaxed stroll, your dog will be in good hands with me.',
        'Dog walking, Exercise routines',
        '99871233',
        '30',
        'Tampines, Singapore',
        4
    ),
    (
        'Unleash your dogs happiness with me!',
        'Greetings, My name is Elizabeth! With 8 years of experience in dog walking, I''m committed to providing the best care for your furry friends. Each walk is designed to be a positive and enriching experience for your dog, considering their energy levels and preferences. My goal is to ensure that your dog''s time with me is enjoyable, safe, and fulfilling.',
        'Dog walking, Enrichment activities',
        '99875555',
        '23',
        'Buona Vista, Singapore',
        5
    );
    

-- inserting dummy reviews --
INSERT INTO review (reviewer_name, star_rating, review, walker_id)
VALUES 
    ('owner1', 3, 'Good dog walker!', 1),
    ('owner2', 3, 'Good dog walker!', 1),
    ('owner3', 3, 'Good dog walker!', 1),
    ('owner4', 4, 'Good dog walker!', 2),
    ('owner5', 4, 'Good dog walker!', 2),
    ('owner6', 2, 'Good dog walker!', 3);

COMMIT;