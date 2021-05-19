# Hotel-UI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.1.1.


## Generate API Client

Before starting the application you need to have the `api-client` folder in your project. The `api-client` folder holds information about `hotel-controller`, namely specifications for endpoints and data transfer objects (DTOs).
To generate this, you need to have `hotel-controller` running first (refer to related `README.MD` file). 

After you successfully start `hotel-controller`, execute the command `npm run generateApiClient`.

Note: Backend needs to be up and running in order to generate `api-client` and regenerate if something changes in the backend endpoint or DTOs.

## Starting up the application

To build and start up `hotel-ui` in local (live rebuild) mode, open the terminal, if you are not already there, navigate to the directory named `hotel-ui` and run the following command:

 ```./startUp.sh ```

Your application will be running on `localhost:4205` and will rebuild after making any changes to the code.

To build and start up `hotel-ui` using same configuration as deployed application in the cloud (no live rebuild):

 ```./startUp.sh dev```

Your application will be running on `localhost:3005`

If you get an error 'Permission denied error' run `chmod +x startUp.sh`.

## Inconsistency in names
The first version of the application was build using certain criteria and design that have later changed. Since the backend of this application is also being used by many other integrated applications, any breaking changes to the mentioned backend would mean breaking changes to integrated applications as well.
Therefore for those reasons and for consistency reasons between Backend/Frontend some of the changes in names are only done in the text visible to the user. In this section you can find the list of inconsistent terms between what user sees and what it is called in the code. 
- In the code: `User` Displayed as: `Employee`
- In the code: `Master ID` Displayed as: `Basis-ID`

## Running unit tests
To execute the unit tests via [Karma](https://karma-runner.github.io).

 ```npm run test```

## Linting

 ```npm run lint```

Lint is being used to enforce project's coding standards. All pull/merge requests need to be passing the lint check. If they don't, the application will fail to build.

## Credentials
A sample user credential has been seeded while starting the application

- username: {your_configured_username}
- password: {your_configured_password}

## Troubleshoot:
If you get the following error 'Object is possibly undefined' when generating the `api-client`, try the steps below:

- comment out the code in the backend (OpenAPIConfiguration.java, line 15)  
```@SecurityScheme(name = "X-API-Key", type = SecuritySchemeType.APIKEY, in = SecuritySchemeIn.HEADER)```
- restart backend
- regenerate `api-client`
