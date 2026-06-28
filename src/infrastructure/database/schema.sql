-- Marketplace Universitario - Schema

CREATE TYPE category_type AS ENUM ('apuntes', 'laptops', 'accesorios');
CREATE TYPE product_condition AS ENUM ('nuevo', 'como_nuevo', 'bueno', 'aceptable');
CREATE TYPE product_status AS ENUM ('disponible', 'vendido', 'pausado');

CREATE TABLE IF NOT EXISTS users (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100)   NOT NULL,
  email            VARCHAR(150)   UNIQUE NOT NULL,
  password         VARCHAR(255)   NOT NULL,
  avatar_url       TEXT,
  bio              TEXT,
  university       VARCHAR(150),
  reputation_score DECIMAL(3,2)   DEFAULT 0.00,
  total_reviews    INT            DEFAULT 0,
  created_at       TIMESTAMP      DEFAULT NOW(),
  updated_at       TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  seller_id   INT            REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200)   NOT NULL,
  description TEXT           NOT NULL,
  price       DECIMAL(10,2)  NOT NULL,
  category    category_type  NOT NULL,
  condition   product_condition,
  status      product_status DEFAULT 'disponible',
  images      TEXT[]         DEFAULT '{}',
  subject     VARCHAR(100),
  university  VARCHAR(150),
  views       INT            DEFAULT 0,
  created_at  TIMESTAMP      DEFAULT NOW(),
  updated_at  TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id)    ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  reviewer_id INT REFERENCES users(id)    ON DELETE CASCADE,
  reviewed_id INT REFERENCES users(id)    ON DELETE CASCADE,
  product_id  INT REFERENCES products(id) ON DELETE SET NULL,
  rating      INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(reviewer_id, product_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id              SERIAL PRIMARY KEY,
  product_id      INT REFERENCES products(id) ON DELETE SET NULL,
  buyer_id        INT REFERENCES users(id)    ON DELETE CASCADE,
  seller_id       INT REFERENCES users(id)    ON DELETE CASCADE,
  last_message    TEXT,
  last_message_at TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, buyer_id, seller_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INT REFERENCES users(id)          ON DELETE CASCADE,
  content         TEXT     NOT NULL,
  read            BOOLEAN  DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_seller   ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status   ON products(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user    ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv     ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_buyer        ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conv_seller       ON conversations(seller_id);

-- Auto-update reputation score
CREATE OR REPLACE FUNCTION update_reputation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    reputation_score = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE reviewed_id = NEW.reviewed_id),
    total_reviews    = (SELECT COUNT(*) FROM reviews WHERE reviewed_id = NEW.reviewed_id)
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reputation ON reviews;
CREATE TRIGGER trigger_update_reputation
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_reputation();
