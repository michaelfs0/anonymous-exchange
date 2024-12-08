# Anonymous text-audio exchange web app made with javascript, node js, html, css and mongodb.

# Requirements:
nodejs, npm, javascript, modern browser with html and css support.

# Installation:
1. Download repo and go to root folder of project.
2. npm init -y
3. npm install express multer mongoose dotenv body-parser crypto
4. make account in mongodb atlas
5. create cluster and database
6. create collection named **messages**
7. rename **1.env** file, delete 1 from name so it should be **.env**
8. modify connection string in **.env** file with your mongodb credentials

# Run:
1. Ensure youre in project's root folder.
2. Node server/server.js
3. Server will run by default on **localhost:3000**

# Audio:
Audio messages will be saved in **public/uploads** in mp3 formatting.
