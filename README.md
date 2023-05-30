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

# Build + Run

Have a recent version of NodeJS installed (https://nodejs.org/)

Have latest version of .Net Core installed (https://www.microsoft.com/net/core)

Get the app settings from Box and put them in your secrets location

### [If you don't have visual studio]
// Go to the Keas.Mvc website directory 

// first time, or when modules change

`npm install`

`dotnet restore`

// To use NVM for windows

`nvm list available`

`nvm install 18.16.0`

//This is the current version of node we are using

`nvm use 18.16.0`

// when you are ready to debug locally

`npm run debug`

### [If you have visual studio]
// Just open it up and run the project!
