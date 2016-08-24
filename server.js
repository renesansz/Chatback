'use strict';

// Command Prompt Title
// --------------------
process.title = 'Chatback Server';

// Some Dependencies
// -----------------
var webSocket = require('websocket').server;
var http = require('http');

// Global Variables
// -----------------
var serverPort  = 1337;
var chatHistory = [];
var clientList  = [];
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange', 'yellow', 'cyan'];

// Sort colors randomnly.
colors.sort(function() { return Math.random() > 0.5; } );

/**
 * Escape html string.
 *
 * @returns {String}
 */
function HTMLEntities(str) {

    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                      
}

/**
 * Initialize HTTP Server
 */
var server = http.createServer();
    server.listen(serverPort, function() {

        console.log('Listening to port: ' + serverPort);

    });

/**
 * Initialize webSocket server
 */
var webSocketSrv = new webSocket({
    httpServer: server
});

/**
 * webSocketSrv connection callback.
 *
 * @param {Object} req - The request sent by client
 */
function webSocketOnRequest(req) {

    console.log('[' + (new Date()) + '] Connection from origin: ' + req.origin);

    var conn = req.accept(null, req.origin);
    var index = clientList.push(conn) - 1;
    var userName = null;
    var userColor = null;

    // Retrieve chat history
    // ----------------------
    if (chatHistory.length > 0)
        conn.sendUTF(JSON.stringify( { type: 'history', data: chatHistory } ));

    // Handle all messages from users
    // -------------------------------
    conn.on('message', function(mes) {

        if (mes.type === 'utf8') {

            var mesStr = mes.utf8Data;

            // If no username yet, set the first message as the username.
            // else, log and broadcast the message
            if (userName === null) {
                userName  = HTMLEntities(mesStr); // Get username
                userColor = colors.shift(); // Assign random color

                conn.sendUTF(JSON.stringify({ type: 'color', data: userColor }));

                console.log('New user connected: ' + userName);

            } else {

                // Keep history of all sent messages
                var mesData = {
                    time: (new Date()).getTime(),
                    text: mesStr,
                    color: userColor,
                    author: userName
                };

                chatHistory.push(mesData);
                chatHistory = chatHistory.slice(-100); // We need only the last 100 messages to be stored.

                // Broadcast received message to all clientList.
                var mesJson = JSON.stringify({
                    type: 'message',
                    data: mesData
                });

                for (var r = 0, limit = clientList.length; r < limit; ++r)
                    clientList[r].sendUTF(mesJson);
                
            }
        }

    });
    // Close connection
    conn.on('close', function(client) {
        if (userName !== null && userColor !== null) {

            console.log('Client ' + client + ' has disconnected.');

            clientList.splice(index, 1); // Remove client from list
            
            colors.push(userColor); // Marked the user's color to be available
        }
    });
}
webSocketSrv.on('request', webSocketOnRequest);