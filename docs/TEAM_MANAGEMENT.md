# Team Management Feature

## Overview
This feature allows trainers to create and manage teams, adding or removing athletes and other trainers as team members.

## Database Schema Changes
The following tables were added to support team management:

### teams
- id (TEXT, primary key)
- name (TEXT, not null)
- description (TEXT, nullable)
- ownerId (TEXT, foreign key to users.id)
- created_at (TIMESTAMP, default now())
- updated_at (TIMESTAMP)

### team_members
- id (TEXT, primary key)
- teamId (TEXT, foreign key to teams.id)
- userId (TEXT, foreign key to users.id)
- role (TEXT, default 'athlete')
- Unique constraint on (teamId, userId)

## Backend Implementation
- Added TeamsService with methods for team creation, member management, and queries
- Added TeamsController with REST endpoints for team operations
- Added TeamsModule to register the service and controller
- Updated DTOs for team operations

## Frontend Implementation
- Added TeamManagement component for trainers in their profile page
- Created API routes for frontend to communicate with backend
- Implemented forms for creating teams and managing members

## API Endpoints
- POST /api/teams/create - Create a new team
- POST /api/teams/:teamId/members/add - Add a member to a team
- DELETE /api/teams/:teamId/members/remove - Remove a member from a team
- GET /api/teams/:teamId/members - Get all members of a team
- GET /api/teams/user/:userId - Get all teams for a user

## Usage
1. Trainers can access team management in their profile page
2. Create teams with a name and optional description
3. Add members to teams by email lookup
4. Assign roles (athlete or trainer) to team members
5. Remove members from teams as needed