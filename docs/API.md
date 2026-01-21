# API Documentation

## Base URL

- **Local Development**: `http://localhost:3001/api`
- **Production**: `https://smart-job-tracker-backend-r5wd.onrender.com/api`

## Authentication

Currently, the API uses a simple `userId` query parameter for user identification. Default: `"default"`.

Future versions will implement JWT authentication.

---

## Endpoints

### Health Check

#### `GET /api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-21T18:10:00.000Z"
}
```

---

## Jobs

### Get All Jobs

#### `GET /api/jobs`

Fetch jobs from external API with optional filters.

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `query` | string | Search by job title or description | `react developer` |
| `skills` | string | Comma-separated skills | `react,typescript` |
| `datePosted` | string | Filter by posting date | `day`, `week`, `month`, `all` |
| `jobType` | string | Filter by job type | `full-time`, `part-time`, `contract`, `internship` |
| `workMode` | string | Filter by work mode | `remote`, `hybrid`, `on-site` |
| `location` | string | Filter by location | `bangalore` |
| `minScore` | number | Minimum match score (0-100) | `70` |
| `userId` | string | User identifier | `default` |

**Example Request:**
```bash
curl "http://localhost:3001/api/jobs?query=react&skills=typescript,node.js&workMode=remote&minScore=70"
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "job-123",
      "title": "Senior React Developer",
      "company": "TechCorp India",
      "location": "Bangalore, Karnataka",
      "workMode": "Remote",
      "jobType": "Full-time",
      "description": "We are looking for a Senior React Developer...",
      "skills": ["React", "TypeScript", "Redux", "Node.js"],
      "salary": "₹25,00,000 - ₹35,00,000",
      "postedDate": "2026-01-19T10:00:00.000Z",
      "applyUrl": "https://example.com/apply",
      "companyLogo": "https://ui-avatars.com/api/?name=TC",
      "matchScore": 85,
      "matchExplanation": "Strong match: You have 4/4 required skills...",
      "matchedSkills": ["React", "TypeScript", "Node.js"]
    }
  ],
  "total": 1,
  "hasResume": true
}
```

### Get Single Job

#### `GET /api/jobs/:id`

Get details of a specific job.

**Parameters:**
- `id` (path): Job ID

**Query Parameters:**
- `userId` (optional): User identifier

**Response:**
```json
{
  "id": "job-123",
  "title": "Senior React Developer",
  "company": "TechCorp India",
  "matchScore": 85,
  "matchExplanation": "Strong match: You have 4/4 required skills..."
}
```

### Get Best Matches

#### `GET /api/jobs/best-matches`

Get top job matches based on user's resume.

**Query Parameters:**
- `userId`: User identifier (default: `"default"`)
- `limit`: Number of matches to return (default: `8`)

**Response:**
```json
{
  "jobs": [
    {
      "id": "job-123",
      "title": "Senior React Developer",
      "matchScore": 92,
      "matchExplanation": "Excellent match! ..."
    }
  ],
  "hasResume": true
}
```

### Clear Job Cache

#### `POST /api/jobs/clear-cache`

Clear the job cache (useful for development/testing).

**Response:**
```json
{
  "success": true,
  "message": "Job cache cleared successfully"
}
```

---

## Resume

### Upload Resume

#### `POST /api/resume/upload`

Upload a resume file (PDF or TXT).

**Headers:**
- `Content-Type: multipart/form-data`

**Body:**
- `file`: Resume file (PDF or TXT, max 10MB)

**Query Parameters:**
- `userId`: User identifier (default: `"default"`)

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/resume/upload?userId=default" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "filename": "resume.pdf",
  "textLength": 2543
}
```

**Error Response:**
```json
{
  "error": "Invalid file type. Please upload PDF or TXT file."
}
```

### Save Resume Text

#### `POST /api/resume/text`

Save resume as plain text (alternative to file upload).

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "text": "John Doe\nSenior Software Engineer\n\nSkills: React, Node.js..."
}
```

**Query Parameters:**
- `userId`: User identifier

**Response:**
```json
{
  "success": true,
  "message": "Resume saved successfully"
}
```

### Get Resume

#### `GET /api/resume`

Check if user has uploaded a resume.

**Query Parameters:**
- `userId`: User identifier

**Response (with resume):**
```json
{
  "hasResume": true,
  "filename": "resume.pdf",
  "uploadedAt": "2026-01-21T10:00:00.000Z",
  "textPreview": "John Doe\nSenior Software Engineer..."
}
```

**Response (no resume):**
```json
{
  "hasResume": false
}
```

### Delete Resume

#### `DELETE /api/resume`

Delete user's resume.

**Query Parameters:**
- `userId`: User identifier

**Response:**
```json
{
  "success": true,
  "message": "Resume deleted"
}
```

---

## Applications

### Create Application

#### `POST /api/applications`

Track a new job application.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "jobId": "job-123",
  "jobTitle": "Senior React Developer",
  "company": "TechCorp India",
  "applyUrl": "https://example.com/apply",
  "appliedAt": "2026-01-21T10:00:00.000Z",
  "status": "applied"
}
```

**Query Parameters:**
- `userId`: User identifier

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "app-456",
    "jobId": "job-123",
    "jobTitle": "Senior React Developer",
    "company": "TechCorp India",
    "applyUrl": "https://example.com/apply",
    "status": "applied",
    "appliedAt": "2026-01-21T10:00:00.000Z",
    "updatedAt": "2026-01-21T10:00:00.000Z",
    "timeline": [
      {
        "status": "applied",
        "date": "2026-01-21T10:00:00.000Z",
        "note": "Application submitted"
      }
    ]
  }
}
```

**Error Response (duplicate):**
```json
{
  "error": "Already applied to this job",
  "existing": {
    "id": "app-456",
    "status": "applied"
  }
}
```

### Get All Applications

#### `GET /api/applications`

Get all job applications for a user.

**Query Parameters:**
- `userId`: User identifier
- `status`: Filter by status (`all`, `applied`, `interview`, `offer`, `rejected`)
- `sortBy`: Sort field (`date`, `company`, `status`)
- `order`: Sort order (`asc`, `desc`)

**Response:**
```json
{
  "applications": [
    {
      "id": "app-456",
      "jobId": "job-123",
      "jobTitle": "Senior React Developer",
      "company": "TechCorp India",
      "status": "interview",
      "appliedAt": "2026-01-21T10:00:00.000Z",
      "updatedAt": "2026-01-21T15:00:00.000Z",
      "timeline": [
        {
          "status": "applied",
          "date": "2026-01-21T10:00:00.000Z",
          "note": "Application submitted"
        },
        {
          "status": "interview",
          "date": "2026-01-21T15:00:00.000Z",
          "note": "Status changed to interview"
        }
      ]
    }
  ],
  "stats": {
    "total": 5,
    "applied": 2,
    "interview": 2,
    "offer": 1,
    "rejected": 0
  }
}
```

### Update Application Status

#### `PATCH /api/applications/:id`

Update the status of an application.

**Parameters:**
- `id` (path): Application ID

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "status": "interview",
  "note": "Scheduled for next Monday"
}
```

**Valid Statuses:**
- `applied`
- `interview`
- `offer`
- `rejected`

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "app-456",
    "status": "interview",
    "updatedAt": "2026-01-21T15:00:00.000Z",
    "timeline": [
      {
        "status": "applied",
        "date": "2026-01-21T10:00:00.000Z",
        "note": "Application submitted"
      },
      {
        "status": "interview",
        "date": "2026-01-21T15:00:00.000Z",
        "note": "Scheduled for next Monday"
      }
    ]
  }
}
```

### Delete Application

#### `DELETE /api/applications/:id`

Delete an application.

**Parameters:**
- `id` (path): Application ID

**Response:**
```json
{
  "success": true,
  "message": "Application deleted"
}
```

### Check Application Status

#### `GET /api/applications/check/:jobId`

Check if user has already applied to a job.

**Parameters:**
- `jobId` (path): Job ID to check

**Response (already applied):**
```json
{
  "applied": true,
  "application": {
    "id": "app-456",
    "status": "applied",
    "appliedAt": "2026-01-21T10:00:00.000Z"
  }
}
```

**Response (not applied):**
```json
{
  "applied": false,
  "application": null
}
```

---

## Chat

### Send Chat Message

#### `POST /api/chat`

Send a message to the AI assistant.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "message": "Show me remote React jobs"
}
```

**Query Parameters:**
- `userId`: User identifier

**Response (job search):**
```json
{
  "success": true,
  "response": {
    "type": "jobs",
    "message": "I found 3 jobs matching your criteria:",
    "jobs": [
      {
        "id": "job-123",
        "title": "Senior React Developer",
        "company": "TechCorp India",
        "workMode": "Remote"
      }
    ]
  }
}
```

**Response (help/general):**
```json
{
  "success": true,
  "response": {
    "type": "help",
    "message": "You can see all your applications in the 'Applications' tab...",
    "jobs": []
  }
}
```

### Get Suggested Prompts

#### `GET /api/chat/suggestions`

Get suggested chat prompts for users.

**Response:**
```json
{
  "suggestions": [
    {
      "text": "Show me remote React jobs",
      "category": "search"
    },
    {
      "text": "Find senior roles posted this week",
      "category": "search"
    },
    {
      "text": "How do I upload my resume?",
      "category": "help"
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

**4xx Client Errors:**
```json
{
  "error": "Missing required fields: jobId, jobTitle, company"
}
```

**5xx Server Errors:**
```json
{
  "error": "Failed to fetch jobs"
}
```

**Status Codes:**
- `200 OK`: Successful request
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently no rate limiting is implemented. Future versions will include:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Caching

Jobs are cached in Redis with the following TTLs:
- Job listings: 1 hour (3600 seconds)
- Match scores: 5 minutes (300 seconds)
- Resume data: No expiration (until updated/deleted)

Cache keys:
- Jobs: `jobs:all` or `jobs:all:{filters_hash}`
- Resume: `resume:{userId}`
- Applications: `applications:{userId}`

---

## External APIs Used

### Adzuna API (Primary)
- **Endpoint**: `https://api.adzuna.com/v1/api/jobs/in/search`
- **Rate Limit**: 500 requests/month (free tier)
- **Documentation**: https://developer.adzuna.com/

### JSearch API (Secondary)
- **Endpoint**: `https://jsearch.p.rapidapi.com/search`
- **Rate Limit**: Varies by RapidAPI plan
- **Documentation**: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch

### Google Gemini AI (Primary AI)
- **Model**: gemini-1.5-flash-latest
- **Use**: Job matching and chat
- **Documentation**: https://ai.google.dev/

### OpenAI API (Backup AI)
- **Model**: gpt-3.5-turbo
- **Use**: Fallback for job matching and chat
- **Documentation**: https://platform.openai.com/docs

---

## Examples

### Complete Job Search Flow

```bash
# 1. Check if user has resume
curl "http://localhost:3001/api/resume?userId=user123"

# 2. Upload resume (if needed)
curl -X POST "http://localhost:3001/api/resume/upload?userId=user123" \
  -F "file=@resume.pdf"

# 3. Search for jobs with filters
curl "http://localhost:3001/api/jobs?userId=user123&query=react&skills=typescript&workMode=remote&minScore=70"

# 4. Get best matches
curl "http://localhost:3001/api/jobs/best-matches?userId=user123&limit=5"

# 5. Apply to a job (track application)
curl -X POST "http://localhost:3001/api/applications?userId=user123" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job-123",
    "jobTitle": "Senior React Developer",
    "company": "TechCorp India",
    "applyUrl": "https://example.com/apply"
  }'

# 6. Get all applications
curl "http://localhost:3001/api/applications?userId=user123"

# 7. Update application status
curl -X PATCH "http://localhost:3001/api/applications/app-456?userId=user123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "interview",
    "note": "First round scheduled"
  }'
```

### AI Chat Examples

```bash
# Job search query
curl -X POST "http://localhost:3001/api/chat?userId=user123" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me remote Python jobs"}'

# Product help
curl -X POST "http://localhost:3001/api/chat?userId=user123" \
  -H "Content-Type: application/json" \
  -d '{"message": "How does matching work?"}'

# General conversation
curl -X POST "http://localhost:3001/api/chat?userId=user123" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is your name?"}'
```

---

## Webhooks (Future)

Future versions will support webhooks for:
- New job matches
- Application status changes
- Interview reminders

---

## SDK/Client Libraries (Future)

Official client libraries planned for:
- JavaScript/TypeScript
- Python
- Go

---

**Last Updated**: 2026-01-21  
**API Version**: 1.0.0
