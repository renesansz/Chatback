 Chatback
==========

A simple chat website with a chat server created using **NodeJS**.

 How to use:
-------------

* First you must have **NodeJS** installed.

* Open the command line and type `npm install`. This will install the dependencies for the server.

* Then type `node server.js` to run the chat server. `Listening on port: 1337` should appear to indicate that the server is running.

* To configure the server IP address for production/local use, open the script file `app/script.js` and simply replace `127.0.0.1` on `var conn = new WebSocket('ws://127.0.0.1:1337');` with the IP address that the server is running on.

* Simply open `app/index.html` and you're good to go.


 LICENSE: MIT
--------------
