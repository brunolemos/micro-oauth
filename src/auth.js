const url = require('url')

const oauth = require('./lib/oauth')
const { getCallbackURLWithQuery, mergeQueryWithURL } = require('./helpers')

module.exports = (req, res) => {
  req.query = url.parse(req.url, true).query

  return oauth.authorize(
    req,
    res,
    { AUTHORIZE_URL: process.env.AUTHORIZE_URL },
    Object.assign({}, req.query, {
      client_id: process.env.CLIENT_ID,
      redirect_uri: getCallbackURLWithQuery(req),
      response_type: 'code',
    })
  )
}
