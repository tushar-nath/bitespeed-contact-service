# Bitespeed Contact Server

This project is a contact management service built using Node.js, TypeScript, Express, and PostgreSQL, with Prisma as the ORM. The application is hosted on Vercel.

## Features

- RESTful API for managing contacts
- Automatically links contacts by email and phone number
- Supports primary and secondary contact precedence
- PostgreSQL database with Prisma ORM

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Vercel CLI (optional, for deployment)

### Installation

1. Clone the repository:

   `git@github.com:tushar-nath/bitespeed-contact-service.git`
   `cd bitespeed-contact-service`

2. Install the dependencies:

   `npm install`

3. Initialize Prisma:

   `npx prisma migrate dev --name init`
   `npx prisma generate`

### API Endpoints

- `GET /api/` - Returns a welcome message
- `GET /api/healthcheck` - Returns a health check status
- `POST /api/identify` - Identifies and links contacts

### Example Request

    POST /api/identify
    Content-Type: application/json

    {
      "email": "example@example.com",
      "phoneNumber": "1234567890"
    }

### Response

    {
      "contact": {
        "primaryContactId": 1,
        "emails": ["example@example.com"],
        "phoneNumbers": ["1234567890"],
        "secondaryContactIds": []
      }
    }
