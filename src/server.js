/**
 * server.js
 * Responsable por inciar nuestra api, inicializa koa con todos sus middleware y tambien inicialzia la conexión de bd
 */
const Koa = require('koa')
const json = require('koa-json')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const yenv = require('yenv')
const mongoose = require('mongoose')

const env = yenv()
const routes = require('./routes')

const apiError = require('./utils/api-error')
const LogManager = require('./utils/logging/log-manager')

// Inicializar nuestro servidor usando koa (similar a express)
const app = new Koa()
const logManager = new LogManager()

// Inicializar los middleware
app.use(bodyParser()).use(json()).use(logger()).use(apiError)

// cargar los routes que escucharan las peticiones http
routes.map((item) => {
  app.use(item.routes()).use(item.allowedMethods())
})

app.on('error', (err, ctx) => {
  console.error('logging error')
  const isOperationalError = logManager.error(err)
  if (!isOperationalError) {
    process.exit(1)
  }
})
// abrir la conexión con MongoDB
mongoose
  .connect(env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => {
    // iniciar el servidor koa para que empiece a escuchar peticiones
    app.listen(env.PORT, () => {
      console.log(`Escuchando en el puerto ${env.PORT}`)
    })
  })
  .catch((error) => {
    console.error(error)
  })
