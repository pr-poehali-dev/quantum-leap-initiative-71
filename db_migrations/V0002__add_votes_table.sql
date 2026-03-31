ALTER TABLE t_p34724636_quantum_leap_initiat.contestants
ADD COLUMN IF NOT EXISTS votes INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS t_p34724636_quantum_leap_initiat.votes (
    id SERIAL PRIMARY KEY,
    contestant_id INTEGER NOT NULL REFERENCES t_p34724636_quantum_leap_initiat.contestants(id),
    voter_ip VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(contestant_id, voter_ip)
);
