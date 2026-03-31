CREATE TABLE t_p34724636_quantum_leap_initiat.contestants (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    city VARCHAR(255) NOT NULL,
    occupation VARCHAR(255),
    about TEXT,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    photo1_url TEXT,
    photo2_url TEXT,
    photo3_url TEXT,
    nomination VARCHAR(50) NOT NULL DEFAULT 'miss',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);
