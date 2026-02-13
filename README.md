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

1.  Make sure you have MongoDB running 
2.  Install the packages:
    ```bash
    npm install
    ```
3.  Set up your `.env.local` file with your DB string and a secret key:
    ```env
    MONGODB_URI=mongodb+srv:<db_username>:<db_password>@work-01.sfziuvu.mongodb.net/
    JWT_SECRET=whatever_you_want
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    (It usually runs on localhost:3000, unless it is connected to frontEnd)

## API Endpoints

I've set up endpoints for Users, Items, and Auth.
-   `GET /api/user` returns the list of users (paginated).
-   `POST /api/user/login` checks credentials and sets the httpOnly cookie.
-   `GET /api/user/profile` uses that cookie to see who you are.
-   `PUT /api/user/profile` allows users to update their first name and last name.
-   `POST /api/user/profile/image` uploads a profile image.
-   `DELETE /api/user/profile/image` removes the current profile image.

