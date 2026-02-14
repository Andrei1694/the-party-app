# Gemini Project Context: React + Vite Frontend

This document provides a comprehensive overview of the React + Vite frontend project for effective collaboration with the Gemini CLI.

## Getting Started

To get a local copy up and running, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Andrei1694/the-party-app.git
    cd the-party-app/frontend
    ```

## Project Overview

This is a modern frontend web application built with [React](https://react.dev/) and [Vite](https://vitejs.dev/). It leverages `@tanstack/react-query` for efficient data fetching and state management, `axios` for promise-based HTTP client requests, and `react-router-dom` for client-side routing. The project is configured with ESLint for code quality and consistency.

### Core Technologies

-   **Framework:** React (v19)
-   **Build Tool:** Vite (v7)
-   **Package Manager:** npm
-   **State Management/Data Fetching:** `@tanstack/react-query`
-   **HTTP Client:** `axios`
-   **Routing:** `react-router-dom`
-   **Linting:** ESLint
-   **Authentication:** Custom `AuthContext` and `ProtectedRoute`

## Building and Running (Frontend)

This project uses `npm` as its package manager.

-   **Install dependencies:**
    ```bash
    npm install
    ```

-   **Run the application in development mode:**
    ```bash
    npm run dev
    ```
    This will start a development server, usually accessible at `http://localhost:5173`.

-   **Build the project for production:**
    ```bash
    npm run build
    ```
    This command compiles and bundles the application for deployment, outputting static files into the `dist` directory.

-   **Run linting checks:**
    ```bash
    npm run lint
    ```
    This command checks the codebase for stylistic and programmatic errors based on the ESLint configuration.

-   **Preview the production build locally:**
    ```bash
    npm run preview
    ```
    After building, this command serves the static production build for local testing.

## Development Conventions

-   **Code Styling:** Adheres to ESLint rules defined in `eslint.config.js`.
-   **Component Structure:** Components are organized within the `src` directory, with `pages` containing route-specific components. Authentication-related components are in `src/auth`.
-   **Data Flow:** Data fetching primarily utilizes `@tanstack/react-query` hooks within components or custom hooks. HTTP requests are handled via `axios` through the `src/requests.js` module.
-   **API Base URL:** The API base URL is configured via the `VITE_API_URL` environment variable, defaulting to `http://localhost:8080/api`.
-   **Authentication:** The application uses a custom authentication context (`AuthContext`) to manage user sessions and protect routes.
