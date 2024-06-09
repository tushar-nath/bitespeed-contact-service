import dotenv from 'dotenv'
dotenv.config()

const AppConfig = {
  PORT: process.env.PORT || 3000,
  BODY_PARSER_LIMIT: '50mb',
}

export default AppConfig
