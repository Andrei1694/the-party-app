# Updating Postman Requests

This guide will explain how to update your Postman requests to interact with the new DTOs, CRUD operations, and the Spring Security login mechanism you've implemented.

## 1. Overview

Postman is a popular tool for API development and testing. We'll use it to send HTTP requests to your Spring Boot application.

**Important Note**: Before sending any requests, ensure your Spring Boot application is running. You can start it from your IDE or by running `./mvnw spring-boot:run` in your terminal.

## 2. Setting up a Postman Collection and Environment

It's highly recommended to organize your requests within a Postman Collection and use an Environment for variables like your base URL.

1.  **Create a Collection**: Click "New" -> "Collection", give it a name (e.g., "Demo App API").
2.  **Create an Environment**: Click the "Environments" tab on the left, then "Add". Name it (e.g., "Localhost") and add a variable:
    *   `Key`: `baseUrl`
    *   `Value`: `http://localhost:8080`
    *   Make sure to select this environment in the dropdown at the top right of Postman.

Now you can use `{{baseUrl}}` in your request URLs.

## 3. Registering a User (New Request)

First, let's create a request to register a new user. This endpoint does not require authentication.

1.  **Create New Request**: In your collection, click "Add Request".
2.  **Method**: `POST`
3.  **URL**: `{{baseUrl}}/api/users/register`
4.  **Headers**:
    *   `Content-Type`: `application/json`
5.  **Body**: Select `raw` and `JSON` from the dropdowns. Enter the following JSON structure:
    ```json
    {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password",
        "userProfile": {
            "telefon": "123-456-7890",
            "cnp": "1234567890123"
        }
    }
    ```
6.  **Send Request**: Click "Send". You should receive a `200 OK` response with the created `UserDto`.

## 4. Logging In (New Request)

After registering, you'll need to log in to access protected endpoints.

1.  **Create New Request**: In your collection, click "Add Request".
2.  **Method**: `POST`
3.  **URL**: `{{baseUrl}}/api/users/login`
4.  **Headers**: (Postman should automatically add `Content-Type: application/x-www-form-urlencoded` when you select the body type below)
5.  **Body**: Select `x-www-form-urlencoded`. Add the following key-value pairs:
    *   `username`: `testuser` (or the username you registered)
    *   `password`: `password` (or the password you registered)
6.  **Send Request**: Click "Send".
    *   **Success (200 OK)**: You should get a "Login successful" message.
    *   **Important**: Postman's interceptor (if enabled) or its cookie management will automatically store the `JSESSIONID` cookie returned by the server. This cookie will be sent with subsequent requests to protected endpoints, allowing you to stay authenticated.

## 5. Get All Users (Updated Existing Request)

This endpoint now returns a `Page<UserDto>` and requires authentication.

1.  **Create New Request** (or update your old one):
2.  **Method**: `GET`
3.  **URL**: `{{baseUrl}}/api/users`
4.  **Headers**: Postman will automatically include the `Cookie` header with the `JSESSIONID` if you logged in successfully in the previous step and the cookie is active.
5.  **Send Request**: Click "Send". You should get a `200 OK` response with a page of `UserDto` objects, including the user you just registered. If you get a `401 Unauthorized`, ensure you have logged in successfully and Postman is sending the cookie.

## 6. Get User by ID (New Request)

This endpoint also requires authentication.

1.  **Create New Request**: In your collection, click "Add Request".
2.  **Method**: `GET`
3.  **URL**: `{{baseUrl}}/api/users/1` (Replace `1` with the actual ID of a user, e.g., the one you registered)
4.  **Headers**: `Cookie` (automatically sent by Postman after login).
5.  **Send Request**: Click "Send". You should get a `200 OK` response with the `UserDto` for the specified ID, or `404 Not Found` if the ID doesn't exist.

## 7. Update User (New Request)

This endpoint requires authentication.

1.  **Create New Request**: In your collection, click "Add Request".
2.  **Method**: `PUT`
3.  **URL**: `{{baseUrl}}/api/users/1` (Replace `1` with the ID of the user you want to update)
4.  **Headers**:
    *   `Content-Type`: `application/json`
    *   `Cookie`: (automatically sent by Postman after login).
5.  **Body**: Select `raw` and `JSON`. Provide the updated `UserDto` information. You can omit fields you don't want to change, but ensure the `id` in the URL matches the user you're updating.
    ```json
    {
        "username": "updated_testuser",
        "email": "updated_test@example.com",
        "userProfile": {
            "telefon": "098-765-4321",
            "cnp": "3210987654321"
        }
    }
    ```
6.  **Send Request**: Click "Send". You should get a `200 OK` response with the updated `UserDto`.

## 8. Delete User (New Request)

This endpoint requires authentication.

1.  **Create New Request**: In your collection, click "Add Request".
2.  **Method**: `DELETE`
3.  **URL**: `{{baseUrl}}/api/users/1` (Replace `1` with the ID of the user you want to delete)
4.  **Headers**: `Cookie` (automatically sent by Postman after login).
5.  **Send Request**: Click "Send". You should get a `204 No Content` response for a successful deletion. If you try to fetch the user again, you should get `404 Not Found`.

## 9. Logging Out (New Request)

To end your authenticated session.

1.  **Create New Request**: In your collection, click "Add Request".
2.  **Method**: `POST`
3.  **URL**: `{{baseUrl}}/api/users/logout`
4.  **Headers**: `Cookie` (automatically sent by Postman with the active session).
5.  **Send Request**: Click "Send". You should get a `200 OK` response with "Logout successful". After this, subsequent requests to protected endpoints will result in `401 Unauthorized` until you log in again.

By following these steps, you can effectively test all the new API endpoints and the authentication flow using Postman.
