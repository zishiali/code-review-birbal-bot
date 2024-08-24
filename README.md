# eg-hackathon23-blr-birbalbot


### Pre-requisite
Need nvm on local machine

### Setup Project & Node

```bash
nvm install 18
nvm use 18
```

## Resolve dependencies

```bash
npm install
```

## Run build

```bash
npm run build
```

## Description

We are creating a custom a github action which will review the pull request. We need to integrate this github action in our repository to use this functionality. This repo is reviewing the PR and using OpenAPI to get the valid comments. After integrating this a github action, there will be review comments on raised PR.


## Yaml file to use this functionality as github action in other repos.

```bash
name: PR review Birbal-Bot

on:
  pull_request:
    paths-ignore:
      - '.github/*'

jobs:
  build:
    runs-on: eg-default
    env:
      NODE_AUTH_TOKEN: ${{ secrets.EG_ARTY_NPM }}
    steps:
      - uses: actions/checkout@v3

      - name: PR review
        continue-on-error: true
        uses: ECP/eg-hackathon23-blr-birbalbot@v1.14
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          apiKey: ${{ secrets.CCR_ES_API_KEY }}
```
