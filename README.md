# University of Dhaka Student Portal

A multi-page React learning project for exploring a Software Engineering student-portal concept. It includes a responsive interface, a small Node.js JSON API, fictional sample records, and a local course-interest workflow.

This is an independent educational demo, not an official University of Dhaka service. The API has no authentication or production data protections. Use fictional information only.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the address printed by Vite (normally `http://127.0.0.1:5173`). The development command starts both the React app and API; Vite forwards `/api` requests to `http://127.0.0.1:3001`. Set `API_PORT` to change the API port in development.

The site is not meant to be opened directly as a file. `project.html` redirects web visitors to the app and shows startup instructions when opened from disk.

## Other commands

```sh
npm run build       # create the production frontend in dist/
npm run dev:api     # run only the API
npm run dev:web     # run only the Vite frontend
npm test            # run API tests
```

For production mode, run `npm run build` and then `npm start`; the Node server serves the frontend and API from the same origin. It listens on `127.0.0.1:3001` by default; set `PORT` to change the port or `HOST` to change the bind address. It intentionally binds only to localhost by default.

## API

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/courses?q=&category=`
- `GET /api/students?q=`
- `GET /api/events`
- `GET /api/news`
- `GET /api/resources`
- `POST /api/enrollments`

Course-interest submissions are validated and saved to the git-ignored `server/store.json` on this machine. Initial demo data comes from `server/data.json`, which remains unchanged. Seed data includes fictional student records and illustrative dates. The JSON store is for local learning, not a production database.

## Pages

- Overview
- Course catalog and search
- Calendar and news
- Fictional student directory
- Learning resources and campus map
- Course-interest form
- Department contact details
- Project information
