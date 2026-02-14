# Gemini Project Context: Spring Boot User API

This document provides a comprehensive overview of the Spring Boot REST API project for effective collaboration with the Gemini CLI.

## Getting Started

To get a local copy up and running, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Andrei1694/the-party-app.git
    cd the-party-app
    ```

## Project Overview

This is a Java Spring Boot application built with Maven. It provides a simple RESTful service for managing users. The application uses an in-memory H2 database for data persistence and is secured using Spring Security with HTTP Basic authentication.

### Core Technologies

-   **Java:** 17
-   **Build Tool:** Maven
-   **Framework:** Spring Boot
    -   `spring-boot-starter-webmvc`: For building RESTful web applications.
    -   `spring-boot-starter-data-jpa`: For database interaction using JPA.
    -   `spring-boot-starter-security`: For authentication and authorization.
-   **Database:** H2 (In-Memory)
-   **API Documentation:** SpringDoc OpenAPI (Swagger UI)
-   **Utilities:** Lombok

## Application Architecture

The project follows a standard layered architecture common in Spring Boot applications:

-   **`controller`**: Contains `UserController` which defines the REST API endpoints (`/api/users`).
-   **`service`**: Contains `UserService` which handles the business logic for user operations.
-   **`repository`**: Contains `UserRepository` which is a Spring Data JPA interface for database interaction.
-   **`model`**: Contains the `User` entity which represents the data model.
-   **`config`**: Contains `SecurityConfig` for configuring web security rules.

## Building and Running (Backend)

This project uses the Maven wrapper (`mvnw`), so a local Maven installation is not required.

-   **Run the application:**
    ```bash
    ./mvnw spring-boot:run
    ```

-   **Run tests:**
    ```bash
    ./mvnw test
    ```

-   **Build the project (create JAR file):**
    ```bash
    ./mvnw clean install
    ```

## API Endpoints and Security

The API is served under the `/api` path.

-   **`GET /api/users`**: Retrieves a paginated list of all users.
-   **`POST /api/users`**: Creates a new user.

### Security

-   Access to all API endpoints requires **HTTP Basic Authentication**.
-   Default credentials are configured in `src/main/resources/application.properties`:
    -   **Username:** `root`
    -   **Password:** `root`
-   CSRF protection is disabled.

## Development and Exploration Tools

Several tools are enabled for easier development and API exploration:

-   **Swagger UI:** Provides interactive API documentation.
    -   **URL:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
    -   The OpenAPI specification is available at `/v3/api-docs`.

-   **H2 Console:** A web-based console for browsing the in-memory database.
    -   **URL:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
    -   **JDBC URL:** `jdbc:h2:mem:testdb`
    -   **Username:** `sa`
    -   **Password:** (leave blank)
