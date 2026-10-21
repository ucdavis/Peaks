#!/usr/bin/env python3
"""Exercise real login, authorization, Razor, and compiled assets over HTTP."""
from html.parser import HTMLParser
from http.cookiejar import CookieJar
import os
import urllib.error
import urllib.parse
import urllib.request


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.token = None
        self.assets = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "input" and attrs.get("name") == "__RequestVerificationToken":
            self.token = attrs.get("value")
        asset = attrs.get("src") if tag == "script" else attrs.get("href") if tag == "link" else None
        if asset and asset.startswith("/vite/assets/"):
            self.assets.append(asset)


base = "http://127.0.0.1:" + os.environ.get("SANDBOX_PORT", "5285")
client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(CookieJar()))
login = Page(client.open(base + "/login").read().decode())
assert login.token, "Login form did not provide antiforgery"
data = urllib.parse.urlencode({"Login": "sandbox-admin", "ReturnUrl": "/sandbox/people", "__RequestVerificationToken": login.token}).encode()
response = client.open(base + "/login/local", data)
assert urllib.parse.urlsplit(response.url).path.lower() == "/sandbox/people", response.url
page = Page(response.read().decode())
assert page.assets, "Authenticated page did not load built Vite assets"
for asset in page.assets:
    assert client.open(base + asset).status == 200
response = client.open(base + "/api/sandbox/people/list")
assert response.status == 200
print("Admin signed in with a real cookie; authenticated page, built assets and people API passed.")
login = Page(client.open(base + "/login").read().decode())
data = urllib.parse.urlencode({"Login": "sandbox-basic", "ReturnUrl": "/", "__RequestVerificationToken": login.token}).encode()
client.open(base + "/login/local", data)
request = urllib.request.Request(base + "/api/sandbox/people/list", headers={"X-Requested-With": "XMLHttpRequest"})
try:
    client.open(request)
    raise AssertionError("Basic user unexpectedly accessed the team API")
except urllib.error.HTTPError as error:
    assert error.code in (401, 403), error.code
print("Basic user denied access to the team API.")
