/**
 * Database Schema & Migration Specification for Users Collection / Table
 * 
 * Supports both:
 * 1. Relational SQL (PostgreSQL / SQLite) DDL
 * 2. Document-based NoSQL (MongoDB Atlas / Mongoose Schema)
 * 3. File-backed persistent JSON Store (Embedded Edge Engine)
 */

import { Schema } from 'mongoose';

/**
 * ------------------------------------------------------------------
 * 1. SQL RELATIONAL SCHEMA (PostgreSQL / SQLite DDL Migration)
 * ------------------------------------------------------------------
 *
 * CREATE TYPE user_role_enum AS ENUM ('TPO', 'Recruiter', 'Student', 'Coordinator');
 * CREATE TYPE user_status_enum AS ENUM ('Active', 'Pending', 'Suspended');
 *
 * CREATE TABLE IF NOT EXISTS users (
 *   id VARCHAR(64) PRIMARY KEY,
 *   name VARCHAR(255) NOT NULL,
 *   email VARCHAR(255) NOT NULL UNIQUE,
 *   password_hash VARCHAR(255) NOT NULL,
 *   role user_role_enum NOT NULL DEFAULT 'Student',
 *   title VARCHAR(255) NOT NULL,
 *   org VARCHAR(255) NOT NULL,
 *   badge VARCHAR(100) NOT NULL,
 *   avatar TEXT,
 *   status user_status_enum NOT NULL DEFAULT 'Active',
 *   phone VARCHAR(50),
 *   student_id VARCHAR(64),
 *   usn VARCHAR(50),
 *   branch VARCHAR(50),
 *   department VARCHAR(100),
 *   cgpa NUMERIC(4, 2),
 *   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
 * );
 *
 * CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
 * CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
 * CREATE INDEX IF NOT EXISTS idx_users_usn ON users (usn);
 */

export const SQL_MIGRATION_DDL = `
-- Migration: 001_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Student',
  title VARCHAR(255) NOT NULL,
  org VARCHAR(255) NOT NULL,
  badge VARCHAR(100) NOT NULL,
  avatar TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  phone VARCHAR(50),
  student_id VARCHAR(64),
  usn VARCHAR(50),
  branch VARCHAR(50),
  department VARCHAR(100),
  cgpa NUMERIC(4, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
`;

/**
 * ------------------------------------------------------------------
 * 2. MONGOOSE / MONGODB SCHEMA DEFINITION
 * ------------------------------------------------------------------
 */
export const MongoUserSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false // Never return password hash in regular queries
    },
    role: {
      type: String,
      enum: ['TPO', 'Recruiter', 'Student', 'Coordinator'],
      required: true,
      default: 'Student',
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    org: {
      type: String,
      required: true,
      trim: true
    },
    badge: {
      type: String,
      default: 'Student Portal'
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Suspended'],
      default: 'Active'
    },
    phone: {
      type: String,
      trim: true
    },
    studentId: {
      type: String,
      sparse: true
    },
    usn: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
      index: true
    },
    branch: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  {
    timestamps: true, // Auto-manages createdAt and updatedAt
    versionKey: false
  }
);
