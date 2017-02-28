const qs = require('qs');
const axios = require('axios');
const { send } = require('micro')

const { mergeQueryWithURL } = require('../helpers');

// this is to make url scheme works, like when redirecting to minder://
const redirectUsingHTML = (res, statusCode, url) => {
  res.setHeader('content-type', 'text/html')
  send(res, statusCode || 302, (
    `<!DOCTYPE html>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content=${JSON.stringify(`0;URL=${url}`)} />
    <script>window.location=${JSON.stringify(url)}</script>`
  ));
}

const isLocalhost = host =>
  host.indexOf('localhost') >= 0
    || host.indexOf('0.0.0.0') >= 0
    || host.indexOf('127.0.0.1') >= 0

exports.getCurrentHostURL = req =>
  isLocalhost(req.headers.host)
    ? `http://${req.headers.host.replace(/(0.0.0.0)|(127.0.0.1)/, 'localhost')}`
    : `https://${req.headers.host}`;

exports.authorize = (req, res, { AUTHORIZE_URL }, _query = req.query) => {
  redirectUsingHTML(res, 301, mergeQueryWithURL(AUTHORIZE_URL, _query));
};

exports.callback = async (
  req,
  res,
  {
    CALLBACK_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    GET_TOKEN_URL,
    PROVIDER = 'OAuth provider',
  },
  _query = req.query,
  _callback = function() {}
) => {
  const { code } = req.query;

  const callback = _callback || function() {};
  const redirectWithData = (statusCode, data) => {
    callback(data.error || null, data.error ? null : data);

    const url = mergeQueryWithURL(CALLBACK_URL, req.query, data);
    redirectUsingHTML(res, statusCode, url);
  };

  if (!code) {
    redirectWithData(401, { error: 'Provide code query param' });
    return;
  }

  try {
    const { status, data } = await axios.post(
      GET_TOKEN_URL,
      qs.stringify(
        Object.assign(
          {},
          {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
          },
          _query
        )
      )
    );

    if (status === 200 && data) {
      const result = typeof data === 'object' ? data : qs.parse(data);

      if (result.error) {
        redirectWithData(401, { error: result.error_description });
      } else {
        result.access_token = result.access_token || undefined;
        redirectWithData(200, result);
      }
    } else {
      redirectWithData(500, { error: `${PROVIDER} server error.` });
    }
  } catch (err) {
    const statusCode = (((err || {}).response || {}).data || {}).code || 500;
    const message = (((err || {}).response || {}).data || {}).error_message ||
      `Please provide CALLBACK_URL, CLIENT_ID, CLIENT_SECRET and GET_TOKEN_URL variables. (or ${PROVIDER} might be down)`;

    redirectWithData(statusCode, { error: message });
  }
};
