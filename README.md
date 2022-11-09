# How to setup your local dev enviroment with test database.

## Prerequisites: NodeJS, Git, and an IDE (Visual Studio Code reccomended) are setup and configured on your machine.

### Setting up code enviroment

1. Clone this repo to your machine using the Code button in top right.

2. Open a terminal in the client directory of this project. Type "npm i". This will install dependancies.

3. Open a terminal in the backend directory of this project. Type "npm i".

### Setting up database enviroment

1. Create new Database called "test3" in phpMyAdmin.

2. Go to SQL tab. Copy paste the sql-create-table.txt. Press Go.

3. Copy paste the sql-load-table.txt. Press Go.

### Running the Enviroment

1. Start phpMyAdmin if not already running.

2. Open a **seperate** terminal in the client directory of this project. Type "npm start".

3. Open a terminal in the backend directory of this project. Type "node index.js".

4. If all went correctly, you should be able to search through the data on localhost:3000.
