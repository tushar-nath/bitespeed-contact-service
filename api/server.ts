import app, { AppDataSource } from '.'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`)
    })
  })
  .catch((error) => console.log('Connection error:', error))

process.on('SIGTERM', close)
process.on('SIGINT', close)

function close() {
  console.log('Shutting down gracefully')
  process.exit(0)
}
