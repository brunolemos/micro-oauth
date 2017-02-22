require('dotenv').config()
const url = require('url')
const querystring = require('querystring')
const axios = require('axios')
const { send } = require('micro')

const createRedirectHTML = (data) => {
  const url = `${process.env.REDIRECT_URL}?${querystring.stringify(data)}`
  return `
<!DOCTYPE html>
<meta charset=utf-8>
<title>Redirecting…</title>
<meta http-equiv=refresh content="0;URL=${url}">
<script>location='${url}'</script>
`
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  const { query } = url.parse(req.url, true)
  const { code } = query

  if (!code) {
    send(res, 401, createRedirectHTML({ error: 'Provide code query param' }))
  } else {
    try {
      const { status, data } = await axios.post(
        process.env.AUTHORIZE_URL,
        querystring.stringify(Object.assign({}, {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `http://${req.headers.host}`,
      }, query)))

      if (status === 200 && data) {
        const result = typeof data === 'object' ? data : querystring.parse(data)

        if (result.error) {
          send(res, 401, createRedirectHTML({ error: result.error_description }))
        } else {
          send(res, 200, createRedirectHTML({ access_token: result.access_token }))
        }
      } else {
        send(res, 500, createRedirectHTML({ error: `${process.env.PROVIDER} server error.` }))
      }
    } catch (err) {
      const statusCode = (((err || {}).response || {}).data || {}).code || 500
      const message = (((err || {}).response || {}).data || {}).error_message
        || `Please provide CLIENT_ID and CLIENT_SECRET as environment variables. (or ${process.env.PROVIDER} might be down)`

      send(res, statusCode, createRedirectHTML({ error: message }))
    }
  }
}
