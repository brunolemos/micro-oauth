const { get, router } = require('microrouter')

const nowConfig = require('../now.json')
Object.assign(nowConfig.env, process.env)

module.exports = router(
  get('/', require('./auth')),
  get('/callback', require('./callback'))
)
