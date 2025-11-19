# pgAdmin Setup and Usage Instructions

## Accessing pgAdmin

After starting your Docker containers with `docker-compose up`, you can access pgAdmin through your web browser:

- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin

## Connecting to Your Database

Once logged into pgAdmin, follow these steps to connect to your PostgreSQL database:

1. In the pgAdmin interface, click on "Add New Server" or right-click on "Servers" and select "Create" > "Server"

2. In the "General" tab:
   - Name: Whiteboard DB

3. In the "Connection" tab:
   - Host name/address: db (this is the service name from docker-compose.yml)
   - Port: 5432
   - Maintenance database: whiteboard
   - Username: postgres
   - Password: postgres

4. Click "Save"

## Database Details

Your database connection details are:
- Database name: whiteboard
- Username: postgres
- Password: postgres
- Host: db (within Docker network) or localhost (from host machine)
- Port: 5432

## Features

With pgAdmin, you can:
- View and edit database tables
- Run SQL queries
- Manage users and permissions
- Backup and restore databases
- Monitor database performance

## Security Note

The default credentials are for development purposes only. In a production environment, you should:
1. Change the pgAdmin login credentials
2. Use environment variables for sensitive data
3. Restrict access to the pgAdmin interface