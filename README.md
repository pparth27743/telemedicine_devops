# Telemedicine Conferencing application

## OverView

Our project idea was to design a system where doctors can meet/consult patients remotely over a video/audio call. As we know there are many already available solutions where doctors and patient can consult over a video call (Hangouts, Skype, Zoom, Google Meet etc.), what our design provides which is unique/different from these already available solutions ?

1. Peer to Peer Connection

   For WebRTC connection, what we will need is a signaling server. The job of this signaling server would be to help the peers connect before establishing a peer to peer connection.
   
   Once the peer to peer connection is established, the signaling server will become obsolete and it won't be required. Even if you disconnect the signaling server while the video call is still going on, you won't face any kind of disconnections. Once the connection is established, the entire thing becomes peer to peer so we can have a secure video chat without worrying about the security issues.

2. Multi-Stream Video Conferences
   
   In this app, any user can add multiple streams over the same connection.Why would we require such a functionality ?
   With this functionality in the patient side there can be devices connected to his/her PC and doctor can see output of it while having conversation with the patient simultaneously.

3. No requirement of sharing ID's
   
   One another feature of this app is there no requirement to share ID's with which the doctors and patient gets connected. When the patient calls any doctor, the notification reaches to the doctor in real time (if he is logged in, in case the doctor is not logged in, the call will be stored in backend as pending and the notification will reach doctor when he logs in) and he/she has to just click a button to accept/reject calls.

## To Run this project follow the steps belows,

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

