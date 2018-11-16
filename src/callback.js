const url = require('url')

const oauth = require('./lib/oauth')
const { getCallbackURLWithQuery, mergeQueryWithURL } = require('./helpers')

module.exports = (req, res) => {
  req.query = url.parse(req.url, true).query

  return oauth.callback(
    req,
    res,
    {
      PROVIDER: process.env.PROVIDER,
      CALLBACK_URL: req.query.callback_url || process.env.CALLBACK_URL,
      CLIENT_ID: process.env.CLIENT_ID,
      CLIENT_SECRET: process.env.CLIENT_SECRET,
      GET_TOKEN_URL: process.env.GET_TOKEN_URL,
    },
    {
      grant_type: 'authorization_code',
      redirect_uri: getCallbackURLWithQuery(req),
    }
  )
}
