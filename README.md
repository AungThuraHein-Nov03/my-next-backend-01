# CSX4107 - Backend API (Week 09)

This is the backend for our class project. It basically just serves JSON data to the React frontend. It's built with Next.js (using the app router) and connects to a MongoDB database.

## What's inside?

-   **`src/app/api/`**: This is where all the API routes live.
    -   `user/route.js`: Handles registering users and getting the user list.
    -   `item/route.js`: Fetches items for the shop.
    -   `admin/initial/route.js`: Run this once to seed the DB if needed.
-   **`src/lib/`**: Helper stuff.
    -   `mongodb.js`: The database connection logic (singleton pattern).
    -   `auth.js`: Handles verifying the JWT tokens from cookies.

## How to run it

1.  Make sure you have MongoDB running (I used local, but Atlas works too).
2.  Install the packages:
    ```bash
    npm install
    ```
3.  Set up your `.env.local` file with your DB string and a secret key:
    ```env
    MONGODB_URI=mongodb://localhost:27017/wad-01
    JWT_SECRET=whatever_you_want
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    (It usually runs on localhost:3000)

## API Endpoints

I've set up endpoints for Users, Items, and Auth.
-   `GET /api/user` returns the list of users (paginated).
-   `POST /api/user/login` checks credentials and sets the httpOnly cookie.
-   `GET /api/user/profile` uses that cookie to see who you are.

The frontend (Vite app) should point to this server.
