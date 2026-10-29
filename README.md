# SupportIQ — AI-Powered Customer Support Ticket System

SupportIQ is a full-stack customer support ticket management application designed to help support teams organize customer issues, identify ticket priorities, and generate suggested customer responses.

**Live Demo:** https://supportiq-frontend-icww.onrender.com

**Backend API:** https://supportiq-j3wx.onrender.com

**API Documentation:** https://supportiq-j3wx.onrender.com/docs

## Features

- **Ticket Management:** Create, view, search, and manage customer support tickets.
- **Automatic Ticket Classification:** Categorize tickets based on their content.
- **Priority Detection:** Identify ticket urgency and assign priority levels.
- **Sentiment Analysis:** Estimate customer sentiment to help understand support requests.
- **AI-Suggested Replies:** Generate context-aware template-based response suggestions for customer tickets.
- **Editable Responses:** Review, edit, and copy suggested replies before sending them.
- **Status Tracking:** Manage tickets through Open, In Progress, Resolved, and Closed statuses.
- **Dashboard Overview:** View ticket counts and monitor support activity.
- **Cloud Database:** Store and retrieve tickets using MongoDB Atlas.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| Database | MongoDB Atlas |
| API Communication | REST API, HTTP, JSON |
| Deployment | Render |
| Version Control | Git and GitHub |

## Architecture

The React frontend communicates with the FastAPI backend through REST endpoints. The backend processes ticket requests, applies classification and response-generation logic, and stores ticket information in MongoDB Atlas.

```text
User
  |
  v
React + Vite Frontend
  |
  v
FastAPI REST API
  |
  +----> Ticket Classification
  |
  +----> Priority and Sentiment Analysis
  |
  +----> Suggested Reply Generation
  |
  v
MongoDB Atlas
```

## Getting Started

### Prerequisites

- Python 3.10 or compatible version
- Node.js and npm
- MongoDB Atlas account or another appropriately configured MongoDB deployment
- Git

### 1. Clone the repository

```bash
git clone https://github.com/BHAVYABHEEMAVARAPU/SupportIQ.git
cd SupportIQ
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```dotenv
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=supportiq
```

Replace the placeholder with your MongoDB connection string. Never commit the real `.env` file or database credentials to GitHub.

Start the backend:

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

Interactive API documentation: `http://127.0.0.1:8000/docs`

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend` for local development:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

For production, configure `VITE_API_URL` in the frontend deployment environment to point to the deployed backend API.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets/` | Retrieve tickets |
| `POST` | `/api/tickets/` | Create a ticket |
| `GET` | `/api/tickets/{ticket_id}` | Retrieve a specific ticket |
| `PATCH` | `/api/tickets/{ticket_id}` | Update ticket fields |
| `POST` | `/api/tickets/{ticket_id}/suggest-reply` | Generate a suggested reply |
| `GET` | `/health` | Check backend health |

For request schemas and interactive testing, visit the [API documentation](https://supportiq-j3wx.onrender.com/docs).

## AI Implementation

SupportIQ currently uses rule-based logic and response templates to classify tickets, estimate sentiment, determine priorities, and generate suggested replies.

The reply-generation feature provides an editable draft for support agents to review before using it. It does not automatically send emails to customers.

## Deployment

The application is deployed using Render:

- **Frontend:** [SupportIQ Dashboard](https://supportiq-frontend-icww.onrender.com)
- **Backend:** [SupportIQ API](https://supportiq-j3wx.onrender.com)
- **API Docs:** [Interactive Documentation](https://supportiq-j3wx.onrender.com/docs)

The frontend uses the `VITE_API_URL` environment variable to communicate with the backend. The backend uses environment variables for MongoDB configuration and CORS settings to allow requests from the deployed frontend.

Note: Free hosting services may sleep after periods of inactivity, so the first request can take longer to respond.

## Future Improvements

- Integrate a local or hosted large language model for more flexible reply generation.
- Add authentication and role-based access control.
- Introduce analytics and ticket-resolution metrics.
- Add automated testing and continuous integration.
- Support response feedback and classification evaluation.

## Contributing

Contributions, suggestions, and bug reports are welcome. Fork the repository, create a feature branch, and submit a pull request.

## License

A license has not yet been specified. Add a `LICENSE` file if you intend to publish this project under an open-source license.

---

Built with React, FastAPI, and MongoDB Atlas.
