# Cuery Backend

This project is a NestJS-based service for shopping cart API.

## Table of Contents

- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Assumptions and Design Decisions](#assumptions-and-design-decisions)
- [API Endpoints](#api-endpoints)

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18.x or later)
- **npm** (v6.x or later)
- **NestJS CLI** (optional but recommended)
- A code editor like **VSCode** (recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/olaitankareem01/tonic-backend.git

2. Navigate to the project directory
   
   ```bash
   cd tonic-backend
   ```
3. Install dependencies

    ```bash 
     npm install
4. Copy the .env.example file to .env and configure any necessary environment variables:

    ```bash
    cp .env.sample .env
  In the .env file, configure your environment variables as needed (e.g., PORT).

### Running the Application

  To start the application:

    ```bash
      npm start
    ```
  Alternatively, you can run the app using docker
### Running the application with docker:
1. Install Docker: Make sure you have Docker installed on your machine. You can download and install it from Docker's official website[https://www.docker.com/].

2. Run the command below to spin up the app, mongodb,and redis:

   ```bash
    docker-compose up -d
   ```

  This command maps port 5500 of the container to port 5500 of your host machine. 
  Open your browser and go to http://localhost:5500/api to access a swagger UI where the api can be tested.

  a user details has been seeded:  {
    email: 'admin@example.com',
    password: 'admin1234!',
  }

### Testing
  Jest is being used for unit testing. To run the test suite, including unit tests and controller tests:

  ## Running Test:
    ```bash
     npm run test
    ```
  ## Running Test Coverage
    To run tests and check coverage:

    ```bash
      npm run test:cov
    ```
### Assumptions and Design Decisions

### 1.   
after login,user can add or remove product from cart, it is saved in the cache.
### 2. 
when the user checks out, order is created in the database and the stock is updated
### 3. 
product details are stored in the cache and updated on checkout
### 4.
Redis lock is used to handle concurrent update of the cart
### 5.
stock is validated when user adds to cart and re-validated on checkout to prevent overselling






        
