# Event Management

## Features



## setup Instructions
1. clone the repository

2. Install dependecies => npm install

3. Configure environment
    create .env file in root Folder

    PORT=5000
    DATABASE_URL=postgres://postgres:password@localhost:5432/eventdb

    here password is PostgreSQL password

4. Create Database and Tables

    CREATE DATABASE eventdb;

    CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        datetime TIMESTAMP NOT NULL,
        location TEXT NOT NULL,
        capacity INT NOT NULL CHECK (capacity > 0 AND capacity <= 1000)
    );

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    );

    CREATE TABLE registrations (
        user_id INT REFERENCES users(id),
        event_id INT REFERENCES events(id),
        PRIMARY KEY (user_id, event_id)
    );

5. Start server
  
   npm run dev or nodemon index.js

## Folder Structure
    Event Management
    |--- controllers/eventController # Business Logic and Roue Handlers

    |--- models/db #Database connection

    |--- routes/eventRoutes #API endpoints definition

    |--- validators/validationControllers #All zod schemas 
    for validation

    |--- index.js/ #Main application entry point

    |---package-lock.json #Exact dependency tree

    |--- package.json #Project meatdata and dependencies
    
    |--- README.md #Project documentation

## API Endpoints

1. POST  /api/events
   Body:
   
    {
    "title": "Web dev session",
    "dateTime": "2025-08-01T10:00:00Z",
    "location": "Delhi",
    "capacity": 500
    }

2. GET  /api/events/upcoming
    Give list of all future events

3. GET /api/events/:id
    id: as params
    Gives details of an event and its registered users

4. POST /api/events/:id/register
    It register an user to an event
    Body:
     {
        "name": "Kapil Dagar",
        "email": "kapil@gmail.com"
    }

5. DELETE api/events/:id/cancel
    Cancel user's registration means delete the user from registrations table
    Body:
        {
           "email": "kapil@gmail.com"
        }

6. GET api/events/:id/stats
    Give details about event like Totalregistrations, RemainigCapacity, Percentage of capacity used
    
## validation    
   validated body data using zod validator


   