# eg-hackathon23-blr-birbalbot

[Express](http://expressjs.com) based Node web app generated using [Primer](http://primer.tools.expedia.com).

## Development

### Prerequisites

Ensure you have `node` (of version specified in `.nvmrc` file) and `npm` installed. You can choose one of these options:

1. Download and install the appropriate version from [here](https://nodejs.org/en/download/releases/).
2. **RECOMMENDED**: Install [nvm](https://github.com/creationix/nvm), and then you can use it to install and manage multiple versions of node on your machine.

### Code Quality

This application uses [ESLint](http://eslint.org) to enforce consistent coding conventions. It is set up to automatically run before tests.

The conventions are based off [Airbnb's JavaScript Style Guide](https://github.com/airbnb/javascript). It is recommended you keep it on as it encourages you towards better coding practices and newer ES6 standards. When you get an ESLint error, along with the message you will also get the rule name that was violated. Example:

```
error    Unexpected var, use let or const instead    no-var
```

In the above case, `no-var` is the rule name. You can then go to `http://eslint.org/docs/rules/RULE_NAME` to learn more about why the rule exists and how to fix the error. For example, here's the explanation for the `no-var` rule: [http://eslint.org/docs/rules/no-var](http://eslint.org/docs/rules/no-var).

However if the ESLint setup is not to your liking, you can modify the rules in the .eslintrc.js file.


### Running the Application

First, ensure all required dependencies are installed:

```
$ npm install
```

Then, to run the app in `dev` environment, execute:

```
$ npm start
```

The command above will launch the app in *cluster* mode if `preferClusterMode` config entry is set to `true`, and in *stand-alone* mode otherwise.

To start the app in any other environment, set `EXPEDIA_ENVIRONMENT` environment variable to one of `test`, `int` or `prod`.

### Secret Management

This app comes with [vault-aws-auth](https://www.npmjs.com/package/vault-auth-aws). Please use this for storing and retrieving secrets and passwords.

See https://confluence/display/POS/EWE+Vault+Application+Integration for more information


#### Logging

Try not to use `console.log` when trying to log something within the application. Instead get an instance of the `support/logger` module by instantiating it like this:

```js
const logger = require('relative-path-to-logger-module-in-support-folder').withIdentifier('id-to-uniquely-identify-current-module');

// The above returns an instance of "winston" logger, so you can then use:
logger.info('Hello world');
logger.error('Something went wrong', error);
```

You can learn more about `winston` [here](https://www.npmjs.com/package/winston).

Getting a logger instance as mentioned above is set up to log to Splunk as expected by Primer. In the [appropriate Splunk instance](https://confluence/display/POS/EWE+Splunk+6+-+Environments), you can find the logs from your application by using this query:

```
index=app sourcetype=eg-hackathon23-blr-birbalbot-log
```

If you notice in `app.js`, two other types of logging are automatically set up:

* Request Access Logs: `index=app sourcetype=eg-hackathon23-blr-birbalbot-access`
* Unhandled Exception Logs: `index=app sourcetype=eg-hackathon23-blr-birbalbot`

### Monitoring

This application will log metrics to statsd. These metrics can then be found at https://graphite.ewetest.expedia.com.
Dashboards can be created at https://hubble.prod.expedia.com with these metrics.

#### Enabling HTTPS

HTTPS has been enabled by default. It is recommended to ONLY use HTTPS for your application.

For convenience, a self signed certificate has been included to enable and test HTTPS. 
It is **highly recommended** to obtained a CA signed certificate and change ```key``` and ```cert``` entries.

In addition to enabling HTTPS, one may have to change ```Primer``` deployment configuration to enable 
the load balancer to forward HTTPS traffic to the instance HTTPS port (```https.port``` in the configuration above).
To do this, one can edit [.primer/deployment.json](.primer/deployment.json) and add the following lines to each environment:

```
    "loadbalancer": {
      "https_enabled": true,
    },
    "app_ssl_port": 8443,
    "app_ssl_protocol": "HTTPS"
```

## About the Build Scripts

### build.sh

`build.sh` file will be used for bundling the application when the build runs. Primer build-deploy pipeline expects a versioned artifact to be deployed on the servers, which is produced by this script. Make changes to the script to include all files that need to be deployed on the server.

### Bower dependencies

If you use Bower to install your front-end dependencies, you will need to add the `postinstall` hook to the Node `package.json` file in the `scripts` section. For example:

```
  "scripts": {
    ...
    "postinstall": "./node_modules/bower/bin/bower --allow-root install"
  }
```

This will install the Bower dependencies via the NPM hook on the `npm install` command. Hence when the Docker image is built and NPM dependencies are installed, the Bower 
dependencies will automatically follow.
  
In addition, NPM will need its full privileges when installing the Bower components into the `/app` folder of the Docker image. Hence, the *.nvmrc* file will need 
[this configuration](https://docs.npmjs.com/misc/config#unsafe-perm):

```
unsafe-perm=true
```

This will run NPM with the user's privileges that are effective when NPM was started. This is necessary as NPM usually downgrades its permissions during such runs, for security 
purposes. 

## Docker

### Docker Prerequisites

For OS X setup instructions, see: [https://ewegithub.sb.karmalab.net/EWE/docker](https://ewegithub.sb.karmalab.net/EWE/docker).

### How to build with Docker?

```
./build.sh
```

```
docker build -t eg-hackathon23-blr-birbalbot .
```

##### How to run with Docker?

```
docker run -e "APP_NAME=eg-hackathon23-blr-birbalbot" -e "EXPEDIA_ENVIRONMENT=dev" -e "ACTIVE_VERSION=$(git rev-parse HEAD)" -p 8080:8080 eg-hackathon23-blr-birbalbot
```

Open a browser and hit [http://LOCAL_DOCKER_IP:8080/](http://LOCAL_DOCKER_IP:8080/) (example: [http://192.168.99.100:8080](http://192.168.99.100:8080)).
