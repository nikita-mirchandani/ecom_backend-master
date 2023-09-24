
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



CREATE TYPE "products_status" AS ENUM (
  'out_of_stock',
  'in_stock',
  'disabled',
  'admin_disabled',
  'removed'
);

CREATE TYPE "payment_status" AS ENUM (
  'completed',
  'pending',
  'declined'
);

CREATE TYPE "item_status" AS ENUM (
  'pending',
  'shipped',
  'in_transit',
  'delivered',
  'delivery_failed',
  'delivery_declined',
  'cancelled',
  'back_ordered'
);

CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "name" varchar NOT NULL
);

CREATE TABLE "users" (
  "id" uuid NOT NULL DEFAULT (uuid_generate_v4()) unique,
  "first_name" varchar,
  "last_name" varchar,
  "email" varchar,
  "password" varchar,
  "phone" varchar,
  "role_id" uuid NOT NULL,
  "created_at" timestamp,
  "modified_at" timestamp,
  PRIMARY KEY ("id", "role_id")
);

CREATE TABLE "user_profile" (
  "user_id" uuid UNIQUE NOT NULL DEFAULT (uuid_generate_v4()),
  "address1" text,
  "address2" text,
  "address3" text,
  "city" varchar,
  "state" varchar,
  "postal_code" varchar,
  "notifications" jsonb,
  "created_at" timestamp,
  "modified_at" timestamp
);

CREATE TABLE "sellers" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "company" varchar NOT NULL,
  "address1" text,
  "address2" text,
  "address3" text,
  "city" varchar,
  "state" varchar,
  "postal_code" varchar,
  "admin_id" uuid NOT NULL,
  "additional_users" uuid[],
  "allowed_categories" uuid[],
  "allowed_brands" uuid[],
  "influencer" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "brands" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "name" text,
  "parent" uuid,
  "is_restricted" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "name" text,
  "parent" uuid,
  "is_restricted" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "name" varchar,
  "short_desc" text,
  "long_desc" text,
  "bullets" text[],
  "brand_id" uuid,
  "category_id" uuid,
  "seller_id" uuid NOT NULL,
  "price" numeric(6,2),
  "min_price" numeric(6,2),
  "max_price" numeric(6,2),
  "original_price" numeric(6,2),
  "status" products_status,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "product_images" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "product_id" uuid NOT NULL,
  "image_link" text NOT NULL,
  "active" boolean DEFAULT true,
  "sequence" int,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "user_id" uuid NOT NULL,
  "total" numeric(6,2),
  "billing_address1" text,
  "billing_address2" text,
  "billing_address3" text,
  "billing_city" varchar,
  "billing_state" varchar,
  "billing_postal_code" varchar,
  "shipping_address1" text,
  "shipping_address2" text,
  "shipping_address3" text,
  "shipping_city" varchar,
  "shipping_state" varchar,
  "shipping_postal_code" varchar,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  "price" numeric(6,2) NOT NULL
);

CREATE TABLE "order_items_status" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "order_item_id" uuid NOT NULL,
  "status" item_status,
  "tracking_carrier" text,
  "tracking_number" text,
  "notes" text
);

CREATE TABLE "payment_details" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "order_id" uuid NOT NULL,
  "payment_status" payment_status,
  "details" jsonb
);

CREATE TABLE "fcm_tokens" (
  "user_id" uuid UNIQUE NOT NULL DEFAULT (uuid_generate_v4()),
  "token" text,
  "active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (now()),
  "modified_at" timestamp DEFAULT (now())
);

ALTER TABLE "users" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "user_profile" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "sellers" ADD FOREIGN KEY ("admin_id") REFERENCES "users" ("id");

ALTER TABLE "brands" ADD FOREIGN KEY ("parent") REFERENCES "brands" ("id");

ALTER TABLE "categories" ADD FOREIGN KEY ("parent") REFERENCES "categories" ("id");

ALTER TABLE "products" ADD FOREIGN KEY ("brand_id") REFERENCES "brands" ("id");

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "products" ADD FOREIGN KEY ("seller_id") REFERENCES "sellers" ("id");

ALTER TABLE "product_images" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "order_items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

ALTER TABLE "order_items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

ALTER TABLE "order_items_status" ADD FOREIGN KEY ("order_item_id") REFERENCES "order_items" ("id");

ALTER TABLE "payment_details" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

ALTER TABLE "fcm_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
