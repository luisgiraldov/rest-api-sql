
# Full Stack JavaScript Techdegree v2 - REST API Project

The API will provide a way for users to administer a school database containing information about courses: users can interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database.

## Overview of the Provided Project Files

Treehouse supplied the following files for use: 

* The `seed` folder contains a starting set of data for the database in the form of a JSON file (`data.json`) and a collection of files (`context.js`, `database.js`, and `index.js`) that can be used to create the app's database and populate it with data (we'll explain how to do that below).
* We've included a `.gitignore` file to ensure that the `node_modules` folder doesn't get pushed to the GitHub repo.
* The `app.js` file configures Express to serve a simple REST API. They've also configured the `morgan` npm package to log HTTP requests/responses to the console. The project maintainer will update this file with the routes for the API.
* The `nodemon.js` file configures the nodemon Node.js module, which they are using to run the REST API.
* The `package.json` file (and the associated `package-lock.json` file) contain the project's npm configuration, which includes the project's dependencies.
* The `RESTAPI.postman_collection.json` file is a collection of Postman requests that you can use to test and explore the REST API.

### Prerequisites

You need Node JS and npm installed
http://treehouse.github.io/installation-guides/

```
Node JS
npm
```

### Installing

A step by step series of examples that tell you how to get a development env running for this project

steps will be:

- make sure you have npm and Node js installed, you can learn how to do that here: http://treehouse.github.io/installation-guides/

-- Download the project files, [here is the link if you need it](https://github.com/luisgiraldov/rest-api-sql)

- Open your terminal/console and make sure to be inside the project folder.
for example
```
cd downloads/project_folder
```


## Getting Started

To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install

```

Second, seed the SQLite database. (This has been already done, it is left here for future references)

```
npm run seed
```

And lastly, start the application.

```
npm start
```

To test the Express server, browse to the URL [http://localhost:5000/](http://localhost:5000/).

## Deployment

Coming Soon with Heroku

## Built With

* [Express](https://expressjs.com/) - The web framework used
* [npm](https://www.npmjs.com/) - Dependency Management
* [Git](https://git-scm.com/) - Version Control System
* [Sequelize](https://sequelize.org/) - ORM
* [SQLite3](https://www.sqlite.org/index.html) SQL database engine

## Authors

* **Lee Vaughn** - *Initial work* - [Teamtreehouse](https://teamtreehouse.com)
* **Robert Manolis** - *Initial work* - [Teamtreehouse](https://teamtreehouse.com)
* **Luis Giraldo** - *Functional Logic* - [Building Portfolio](https://luisgiraldov.com)
