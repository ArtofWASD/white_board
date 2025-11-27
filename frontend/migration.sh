#!/bin/bash

# Create directories
mkdir -p src/features/auth
mkdir -p src/features/teams
mkdir -p src/features/events
mkdir -p src/features/dashboard
mkdir -p src/components/layout
mkdir -p src/components/ui

# Move Auth components
mv src/components/AuthForms.tsx src/features/auth/

# Move Team components
mv src/components/CreateTeamModal.tsx src/features/teams/
mv src/components/EditTeamModal.tsx src/features/teams/
mv src/components/TeamManagement.tsx src/features/teams/

# Move Event components
mv src/components/AddEventButton.tsx src/features/events/
mv src/components/AddEventForm.tsx src/features/events/
mv src/components/EventActionMenu.tsx src/features/events/
mv src/components/EventModal.tsx src/features/events/
mv src/components/Calendar.tsx src/features/events/
mv src/components/AthleteEvents.tsx src/features/events/
mv src/components/AddResultModal.tsx src/features/events/

# Move Dashboard components
mv src/components/UserDashboard.tsx src/features/dashboard/

# Move Layout components
mv src/components/Header.tsx src/components/layout/
mv src/components/Footer.tsx src/components/layout/
mv src/components/LeftMenu.tsx src/components/layout/

echo "Migration completed!"
