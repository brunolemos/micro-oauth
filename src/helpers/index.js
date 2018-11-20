const omit = require('lodash/omit')
const qs = require('qs')

const oauth = require('../lib/oauth')

exports.mergeQueryWithURL = (url, ...queryObjs) => {
  const [, urlWithoutQuery, queryStringFromURL] =
    (url || '').match(/([^?]+)[?]?(.*)/) || []
  const queryFromURL = qs.parse(queryStringFromURL)

  const mergedQuery = Object.assign({}, ...queryObjs, queryFromURL)
  const mergedQueryString = qs.stringify(mergedQuery) || ''

  return `${urlWithoutQuery || ''}?${mergedQueryString}`
}

exports.getBaseCallbackURL = req => `${oauth.getCurrentHostURL(req)}/callback`

exports.getCallbackURLWithQuery = (req, query = req.query) => {
  return exports.mergeQueryWithURL(
    exports.getBaseCallbackURL(req),
    omit(query, [
      'client_id',
      'code',
      'grant_type',
      'redirect_uri',
      'response_type',
      'scope',
    ])
  )
}
