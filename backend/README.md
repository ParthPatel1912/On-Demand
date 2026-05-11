# OnDemand Service – Backend

This directory contains the **Node.js backend starter** for the OnDemand Service project.
It provides the API layer that will be used by the frontend application.

## Prerequisites

Make sure the following are installed on your system:

* **Node.js (LTS version)**
* **npm (Node Package Manager)**
* **Git**

Verify installation:

```
node -v
npm -v
git --version
```

---

## Setup Backend Locally

1. Navigate to the backend folder:

```
cd backend
```

2. Install project dependencies:

```
npm install
```

3. Start the development server:

```
npm start
```

or if using nodemon:

```
npm run dev
```

---

## Project Structure

```
backend/
│
├── src/            # Application source code
│
├── package.json    # Project dependencies and scripts
│
└── README.md       # Backend documentation
```

---

## Default Server URL

After starting the server, the backend will run on:

```
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file in the backend root directory if required.

Example:

```
PORT=3000
NODE_ENV=development
```

---

## Development Notes

* Ensure the backend server is running before connecting the frontend.
* API endpoints will be added inside the `src` folder.
* Follow consistent coding standards and commit practices.

---

## Scripts

Commonly used npm scripts:

```
npm start      # Start backend server
npm run dev    # Start server with nodemon (development mode)
```

---

## Contribution

1. Create a feature branch.
2. Make your changes.
3. Commit and push your code.
4. Create a Merge Request for review.
