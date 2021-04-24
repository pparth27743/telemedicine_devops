1. After signout, If we try to login again then it is not working. We have to refresh the page.
2. Remove commented code from home and profile component.
3. Think about lazy lodaing mota bhai



version
"socket.io-client": "^2.3.0"
"ngx-socket-io": "^3.2.0",


# Make things works for https prefix...
put following under serve,architect,<project-name>,projects in angular.json file 
```
    "sslKey": "./encryption/key.pem",
    "sslCert": "./encryption/cert.pem",
    "ssl": true
```