# Bitespeed Contact Service

This is a Node.js Express application that provides APIs for identifying contacts. It uses TypeORM with a PostgreSQL database.

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL database

## Installation

1. Clone the repository
2. Install dependencies: `npm install`

## Running the Application

To start the application, run:
`npm start`

This will start the server on `http://localhost:3000`.

## Endpoints

- `GET /api/healthcheck`: Health check endpoint to verify if the server is running.
- `POST /api/identify`: Identify a contact. Send the contact data in the request body.

## Sample Request

```bash
curl --location 'http://localhost:3000/api/identify' \
--header 'Content-Type: application/json' \
--header 'Cookie: authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiQ2dneEFDWEV3QThrdnctazVLc1hFYjZ3TDN2b0FCSGk0MF9mUS0zMnFQakRCSlBxejlUeWtnMkV3RVNvZlJLaHBFY05jQkFkdFJCQXpxcTdNSzczYVEifQ..lTp3SBPVJwDCMj4p5N6rEw.RdQ0E1xyirtF9_vBkn6-Ywf3MnMoGQKJt5cZYEsBzN4d6z-6Sh5M65zLSl2ZjuaszNo93B6g1RcRnMtB4sNux1WqYT_nNNOQ6oJM7vLU6sDbwDRDxDMk9_iXb5VdtnbYb4WvugL-dliK8IVn3-Vs1esx6oqflz3Qt-3HGqPRotHnqbR8TbSBc7FuTJyAtovLli2s-F4Eol15Sz6dMfhm-XkmLzQ_gVQcG83cOKtjxuA.NO0CoSZMlz1WcsfgjuiquxbixqymAT-rp-dH2pk4Oxs' \
--data-raw '{
"email": "george@hillvalley.edu",
"phoneNumber": "717171"
}'
```

## Video Walkthrough

Here's a video walkthrough demonstrating the usage of the APIs:

https://github.com/tushar-nath/bitespeed-contact-service/assets/50198727/31a01470-c0dc-4cb9-99af-cf8df895e589

## Note: 
The `DATABASE_URL` environment variable has been added to the `.env` file for connecting to the PostgreSQL database.
