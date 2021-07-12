# What's Happening?

A RESTful web application where users can create, view and register for events.

## Running locally

### `.env` file
Create a `.env` file in the backend directory of this project including the following information

```
MYSQL_HOST={host url}
MYSQL_USER={your username}
MYSQL_PASSWORD={your password}
MYSQL_DATABASE={database name}
```

### Running the backend

```
cd backend
npm install
npm run start
```
The server will be accessible on localhost:4941

### Running the frontend

```
cd frontend
npm install
npm run serve
```
The client will be accessible on localhost:8080
