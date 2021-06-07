# Proxy

This page explains how to get vscode-xml to work through a proxy.

## Prerequisites

If you want to use the binary language server,
then you will need to make sure that your proxy allows connections to jboss.org
since the binary language server is downloaded from that website.
You will also need to make sure that you can access any online XML schemas that you want to work with through the proxy.

## Setting up the proxy in VS Code

VS Code provides a setting called `http.proxySupport`.
If you set it to `override`, VS Code will attempt to rewrite the requests from extensions to go through the proxy that is configured for VS Code.
However, this method sometimes does not work correctly.

The tested way to get vscode-xml to use your proxy is to set the following settings:
 * `http.proxy`:
   The address at which the proxy can be accessed.
   As an example, use `"http://localhost:3128"` for a proxy running on your machine on port 3128.
 * `http.proxyAuthorization`:
   The authorization header to use for the proxy requests.
   This is only needed when the proxy requires authorization.
   This follows the form `"[type] [credientials]"`,
   where `type` is the authorization type that the proxy uses,
   and `credentials` are your credentials for accessing the proxy.
   The format of the `credentials` is different for each authorization type.
   For instance, `"Basic dXNlcm5hbWU6cGFzc3dvcmQ="` is the authorization header
   for a proxy that uses Basic authorization,
   where your username is `username` and your password is `password`.
   The credentials, `"dXNlcm5hbWU6cGFzc3dvcmQ="`, is `username:password` encoded in base64,
   which is the format that is expected for Basic authorization.
   Please refer to [this MDN link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) for more information about authorization headers.

Once these settings are set,
vscode-xml will forward any requests that it makes through the proxy,
such as the binary server download request
and requests from the language server to download schema.
