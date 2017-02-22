# `micro-oauth`

A tiny microservice that makes it easier to add OAuth authentication to your application.
This supports any provider that follows the OAuth2 protocol, like GitHub and Instagram.

## Usage

Running your own `micro-oauth` is a single [`now`](https://now.sh) command away:

```sh
# Deploy this repository using now.sh
now brunolemos/micro-oauth -e PROVIDER=GitHub -e AUTHORIZE_URL=https://github.com/login/oauth/access_token -e CLIENT_ID=abc123 -e CLIENT_SECRET=abc123 -e REDIRECT_URL=myapp://oauth/github
```

To log people in they just have to click on a link to `https://github.com/login/oauth/authorize?client_id=abc123`. (where `client_id` is your GitHub app client id) This will redirect them to the GitHub sign in page for your app, which looks like this:

![Authorize my app to access your data on GitHub](https://cloud.githubusercontent.com/assets/7525670/22627265/fc50c680-ebbf-11e6-9126-dcdef37d3c3d.png)

> You can change the scope of the data you can access with the `scope` query param, see the [GitHub docs](https://developer.github.com/v3/oauth/#scopes)!

When authentication is successful, the user will be redirected to the `REDIRECT_URL` with the access token from GitHub for you to use! 🎉

For Instagram, for exemple, the URL is `https://www.instagram.com/oauth/authorize/?response_type=code&client_id=abc123&redirect_uri=http://localhost:3000`.


### Environment variables

You'll need to provide these environment variables when running `micro-oauth`:

```sh
# The provider you are authenticating on (e.g. GitHub, Instagram, ...)
PROVIDER=GitHub
# ...or PROVIDER=Instagram, ...

# Provider's url to get the access token
AUTHORIZE_URL=https://github.com/login/oauth/access_token
# ...or AUTHORIZE_URL=https://api.instagram.com/oauth/access_token, ...

# Your application client id
CLIENT_ID=abc123

# Your application client secret
CLIENT_SECRET=abc123

# The URL to redirect the user to once the authentication was successful
REDIRECT_URL=myapp://oauth/github
# ...or REDIRECT_URL=http://localhost:1234/my/oauth/callback/xxx, ...
```

> Create an application on on provider website (e.g. [GitHub](https://github.com/settings/applications/new), [Instagram](https://www.instagram.com/developer/clients/register/), ...) to get your client id and secret if you haven't done that already.

When authentication was successful, the user will be redirected to the `REDIRECT_URL` with the `access_token` query param set to the provider access token. You can then use that token to interact with the Provider API! (see: [GitHub API](https://developer.github.com/v3/), [Instagram API](https://www.instagram.com/developer/endpoints/), ...)

> E.g. setting `REDIRECT_URL=myapp://oauth/github` will redirect them to `myapp://oauth/github/?access_token=abc123`. (where `abc123` is the provided access token)

### Finish setup

To make this work you have to set the authorization callback URL of [your application on GitHub](https://github.com/settings/developers) to whatever URL `now` gave you:

![Authorization callback URL: 'your-url.now.sh'](https://cloud.githubusercontent.com/assets/7525670/22621592/95546272-eb27-11e6-80f3-6a2cd556d319.png)

### Error handling

In case an error happens (either by the service or on GitHub) the user will be redirected to the `REDIRECT_URL` with the `error` query param set to a relevant error message.

## Development

```sh
git clone git@github.com:brunolemos/micro-oauth.git
```

Move `.env.example` to `.env` and fill in your GitHub API details and redirect url

```sh
npm run dev
```

The server will then be listening at `localhost:3000`, so set the authorization callback URL of your dev application on the provider website to that.

## Updating

The `master` branch of this repository is what you will be deploying. To update to a new version with potential bugfixes, all you have to do is run the `now` command again and then set the authorization callback URL on GitHub to the new URL that `now` gave you! 👌

## License

Copyright (c) 2017 [Bruno Lemos](https://twitter.com/brunolemos) & [Maximilian Stoiber](https://twitter.com/mxstbr), licensed under the MIT license.
See [LICENSE.md](LICENSE.md) for more information.
