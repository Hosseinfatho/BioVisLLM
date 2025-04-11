# BioVisLLM

A web application for displaying and analyzing biomedical images with advanced features.

## Prerequisites

- Node.js (version 18 or higher)
- npm (version 8 or higher)
- Python 3.8 or higher (for backend)

## Installation and Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file and set environment variables
# OPENAI_API_KEY=your_api_key_here

# Start backend server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
BioVisLLM/
├── backend/                 # Backend server
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/        # API routes
│   │   └── server.ts      # Main server file
│   └── package.json
│
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── styles/       # CSS files
│   │   └── App.tsx       # Main component
│   └── package.json
│
└── README.md
```

## Features

- Display of biomedical images
- Support for various image formats
- Zoom and pan capabilities
- Metadata display
- Modern and responsive user interface

## Default Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Important Notes

1. Ensure that the ports are not in use by other applications.
2. Image files should be placed in the `data` directory.
3. For AI features, you need to set a valid OpenAI API Key in the `.env` file.

## Troubleshooting

### Port Already in Use Error

If you encounter the `EADDRINUSE` error:

1. Stop running processes:
```bash
# On Windows
taskkill /F /IM node.exe

# On Linux/Mac
pkill node
```

2. Restart the servers.

### Dependency Errors

If you encounter dependency errors:

1. Delete the `node_modules` directory
2. Delete the `package-lock.json` file
3. Reinstall dependencies:
```bash
npm install
```

## Contributing

To contribute to the project:

1. Fork the project
2. Create a new branch
3. Commit your changes
4. Submit a pull request

## License

This project is licensed under the MIT License. 