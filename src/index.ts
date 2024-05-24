import "reflect-metadata";
import { DataSource } from "typeorm";
import express from "express";
import routes from "./routes";
import { Contact } from "./models/contact";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL); // Debugging line

const app = express();

app.use(express.json());
app.use("/api", routes);

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Contact],
  synchronize: true,
  logging: false,
  ssl: {
    rejectUnauthorized: false,
  },
});

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server started on http://localhost:3000");
    });
  })
  .catch((error) => console.log("Connection error:", error));
