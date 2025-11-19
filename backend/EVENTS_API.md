# Events API Documentation

This document describes the API endpoints for managing athlete events in the system.

## Table of Contents
- [Events API Documentation](#events-api-documentation)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Event Entity](#event-entity)
  - [API Endpoints](#api-endpoints)
    - [Create Event](#create-event)
    - [Get Events by User ID](#get-events-by-user-id)
    - [Get Past Events by User ID](#get-past-events-by-user-id)
    - [Get Future Events by User ID](#get-future-events-by-user-id)
    - [Update Event Status](#update-event-status)
    - [Delete Event](#delete-event)

## Overview

The Events API allows athletes and trainers to manage events in which athletes have participated or will participate in the future. Events can be training sessions, competitions, or any other sports-related activities.

## Event Entity

```typescript
interface Event {
  id: string;              // UUID
  title: string;           // Event title
  description?: string;    // Optional description
  eventDate: Date;         // Date and time of the event
  status: 'past' | 'future'; // Event status
  exerciseType?: string;   // Optional exercise type
  userId: string;          // UUID of the user who owns this event
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last update timestamp
}
```

## API Endpoints

### Create Event

Creates a new event for a user.

**Endpoint:** `POST /events`

**Request Body:**
```json
{
  "userId": "uuid",
  "title": "string",
  "eventDate": "ISO 8601 date string",
  "description": "string (optional)",
  "exerciseType": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "eventDate": "ISO 8601 date string",
  "status": "future",
  "exerciseType": "string",
  "userId": "uuid",
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string"
}
```

**Status Codes:**
- 201: Event created successfully
- 400: Invalid request data
- 500: Server error

### Get Events by User ID

Retrieves all events for a specific user, ordered by event date.

**Endpoint:** `GET /events/:userId`

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "eventDate": "ISO 8601 date string",
    "status": "past|future",
    "exerciseType": "string",
    "userId": "uuid",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  }
]
```

**Status Codes:**
- 200: Events retrieved successfully
- 404: User not found
- 500: Server error

### Get Past Events by User ID

Retrieves all past events for a specific user, ordered by event date (descending).

**Endpoint:** `GET /events/:userId/past`

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "eventDate": "ISO 8601 date string",
    "status": "past",
    "exerciseType": "string",
    "userId": "uuid",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  }
]
```

**Status Codes:**
- 200: Events retrieved successfully
- 404: User not found
- 500: Server error

### Get Future Events by User ID

Retrieves all future events for a specific user, ordered by event date (ascending).

**Endpoint:** `GET /events/:userId/future`

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "eventDate": "ISO 8601 date string",
    "status": "future",
    "exerciseType": "string",
    "userId": "uuid",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  }
]
```

**Status Codes:**
- 200: Events retrieved successfully
- 404: User not found
- 500: Server error

### Update Event Status

Updates the status of an event (past/future).

**Endpoint:** `PUT /events/:eventId/status`

**Request Body:**
```json
{
  "status": "past|future"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "eventDate": "ISO 8601 date string",
  "status": "past|future",
  "exerciseType": "string",
  "userId": "uuid",
  "createdAt": "ISO 8601 date string",
  "updatedAt": "ISO 8601 date string"
}
```

**Status Codes:**
- 200: Event status updated successfully
- 400: Invalid status value
- 404: Event not found
- 500: Server error

### Delete Event

Deletes an event.

**Endpoint:** `DELETE /events/:eventId`

**Response:**
- 204: Event deleted successfully
- 404: Event not found
- 500: Server error