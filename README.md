[![Node Version](https://img.shields.io/badge/dynamic/json?color=green&label=node&query=%24.engines.node&url=https%3A%2F%2Fraw.githubusercontent.com%2Fucdavis%2FPeaks%2Fmaster%2FKeas.Mvc%2FClientApp%2Fpackage.json)](https://img.shields.io/badge/dynamic/json?color=green&label=node&query=%24.engines.node&url=https%3A%2F%2Fraw.githubusercontent.com%2Fucdavis%2FPeaks%2Fmaster%2FKeas.Mvc%2FClientApp%2Fpackage.json)
[![Build Status](https://dev.azure.com/ucdavis/Peaks/_apis/build/status/ucdavis.Peaks?branchName=master)](https://dev.azure.com/ucdavis/Peaks/_build/latest?definitionId=12&branchName=master)

[![forthebadge](http://forthebadge.com/images/badges/uses-html.svg)](http://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/contains-technical-debt.svg)](https://forthebadge.com)

# PEAKS (formerly Keas)

**P**eople
**E**quipment
**A**ccess
**K**eys
**S**pace

# Build and run

Install the .NET SDK selected by [`global.json`](global.json). Use Node.js 20 to match the [CI pipeline](azure-pipelines.yml), with npm 10 or newer as required by the [frontend package](Keas.Mvc/ClientApp/package.json).

With NVM for Windows:

```sh
nvm install 20
nvm use 20
```

Get the application settings from Box and configure the website's user secrets.

From the repository root, install the frontend dependencies and start the website:

```sh
cd Keas.Mvc/ClientApp
npm install
cd ..
dotnet restore
npm start
```

`npm start` runs `dotnet watch run` from `Keas.Mvc`.

With Visual Studio, open `Keas.sln` and run `Keas.Mvc` after completing the dependency and secrets setup.

## Optional local development login

To bypass CAS locally, enable the login screen with a personal user secret:

```sh
dotnet user-secrets set "LocalLogin:Enabled" "true" --project Keas.Mvc
```

Run the app in `Development` and open `/login`. Enter the Kerberos ID or email
of an existing user in your configured database, or choose **Sign in with CAS**.
Local login uses that user's current database permissions and does not create
accounts or grant roles. Peaks has no account-level active flag. Unknown or
ambiguous identities are rejected. Local sessions log out back to `/login`,
where you can choose another user; cached permissions are cleared on sign-in
and logout. CAS sessions keep their normal CAS logout behavior.

The feature is disabled by default and unavailable outside `Development`, even
if the setting is enabled. Keep development instances bound to localhost because
anyone who can reach an enabled instance can sign in as an existing user. No
tracked launch settings need to change. To disable the feature:

```sh
dotnet user-secrets remove "LocalLogin:Enabled" --project Keas.Mvc
```
