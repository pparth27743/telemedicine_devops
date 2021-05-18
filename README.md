# Telemedicine Conferencing application

### To Run this project follow the steps belows,

1. Git Clone the repository
2. Open terminal inside the repository/folder in your machine.
3. Install dependancy for the project, to do so type following commands in terminal.
    ```
    cd Ng-frontend/ 
    npm install
    cd ..

    cd Backend/
    npm install
    cd ..

    cd WebRTC_Signaling_Server/
    npm install
    cd ..
    ``` 

4. Now let's run the application, so first make sure you MySQL server is running. 
5. There are 3 things frontend, backend and webrtc-server int the project and we have to run each one of them. So open 3 different termial in the repository. 
6. Type `cd Ng-frontend/ && ng serve` in frist terminal.
7. Type `cd Backend/ && node app.js ` in second terminal.
8. Type `cd WebRTC_Signaling_Server/ && node webrtc-server.js` in third terminal.
9. Now application is up and running you can access it on `https://localhost:4200/` 

As there are no Doctor and Patient in the database, first you have to signup a Doctor and Patient to use application. 

