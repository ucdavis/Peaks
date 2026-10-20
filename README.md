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
