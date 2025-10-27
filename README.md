# Group Project 2 - Todo Application

A full-stack todo application built with .NET 8 Web API backend and vanilla JavaScript frontend with Bootstrap 5.

## Project Structure

```
GroupProject2/
├── backend/
│   └── GroupProject2.API/          # .NET 8 Web API
├── frontend/
│   ├── index.html                  # Main HTML file
│   └── js/
│       └── app.js                  # JavaScript application
├── api/                            # SQLite database location
└── README.md
```

## Technology Stack

### Backend
- **Framework**: .NET 8 Web API (ASP.NET Core)
- **Database**: SQLite with direct SQL queries
- **Architecture**: RESTful API with proper HTTP methods

### Frontend
- **HTML/CSS**: Single-page application with Bootstrap 5.x
- **JavaScript**: Vanilla ES6+ with async/await
- **UI Framework**: Bootstrap 5.x from CDN

## Getting Started

### Prerequisites
- .NET 8 SDK installed
- Modern web browser

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend/GroupProject2.API
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

The API will be available at:
-HTTP: http://localhost:5210
-Swagger UI: http://localhost:5210/swagger/index.html

### Running the Frontend

1. Open the `frontend/index.html` file in your web browser
2. The frontend will attempt to connect to the backend API
3. If the backend is not running, you'll see connection error messages

### API Endpoints

- `GET /api/todo` - Get all todos
- `GET /api/todo/{id}` - Get todo by ID
- `POST /api/todo` - Create new todo
- `PUT /api/todo/{id}` - Update todo
- `DELETE /api/todo/{id}` - Delete todo

### Database

The SQLite database is automatically created in the `/api` folder when the backend starts. The database includes a `TodoItems` table with the following schema:

- `Id` (INTEGER PRIMARY KEY)
- `Title` (TEXT NOT NULL)
- `Description` (TEXT)
- `IsCompleted` (INTEGER DEFAULT 0)
- `CreatedAt` (TEXT NOT NULL)
- `UpdatedAt` (TEXT)

## Features

### Backend Features
- RESTful API design
- SQLite database with direct SQL queries
- Proper error handling and HTTP status codes
- CORS configuration for frontend integration
- Swagger documentation

### Frontend Features
- Responsive Bootstrap 5 design
- Add, edit, delete, and toggle todos
- Real-time updates
- Loading states and error handling
- Modern UI with Bootstrap components

## Development Notes

- The frontend uses vanilla JavaScript with no build process
- Bootstrap is loaded from CDN
- The backend uses direct SQL queries (no ORM)
- CORS is configured to allow frontend connections
- The database file is created automatically on first run

## Troubleshooting

1. **Frontend can't connect to backend**: Ensure the backend is running and check the API URL in `frontend/js/app.js`
2. **Database errors**: Check that the `/api` folder exists and is writable
3. **CORS errors**: Verify the CORS configuration in `Program.cs` matches your frontend URL
