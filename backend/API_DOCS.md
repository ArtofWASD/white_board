# API Documentation

## Authentication

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Data Params**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**:
  - Code: 200
  - Content:
    ```json
    {
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "trainer|athlete",
        "height": "number (optional)",
        "weight": "number (optional)"
      },
      "token": "string"
    }
    ```

### Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Data Params**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "trainer|athlete"
  }
  ```
- **Success Response**:
  - Code: 201
  - Content:
    ```json
    {
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "trainer|athlete",
        "height": "number (optional)",
        "weight": "number (optional)"
      },
      "token": "string"
    }
    ```

## Error Responses

- **Code**: 400 BAD REQUEST
  - Content: `{ "message": "All fields are required" }`

- **Code**: 401 UNAUTHORIZED
  - Content: `{ "message": "Invalid credentials" }`

- **Code**: 500 INTERNAL SERVER ERROR
  - Content: `{ "message": "An error occurred during the process" }`