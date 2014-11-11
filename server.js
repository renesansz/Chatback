'use strict';

process.title = 'Chatback Server';

var WebSocket = require('websocket').server,
    http = require('http');

/**
 * Global Variables
 */
var serverPort = 1337,
    chatHistory = [],
    clientList = [],
    colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange', 'yellow', 'cyan'];

// Sort colors randomnly.
colors.sort(function() { return Math.random() > 0.5; } );

/**
 * Function: HTMLEntities
 *
 * Escape html string.
 *
 * Return:
 * 
 *     String - The espaced string.
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
 * Initialize WebSocket server
 */
var webSocketSrv = new WebSocket({
    httpServer: server
});

/**
 * Function: WebSocketOnRequest
 * 
 * WebSocketSrv connection callback.
 *
 * Parameter:
 * 
 *     req - The request sent by client.
 */
function WebSocketOnRequest(req) {
    // console.log(req.origin);
    console.log('[' + (new Date()) + '] Connection from origin: ' + req.origin);

    var conn = req.accept(null, req.origin),
        index = clientList.push(conn) - 1,
        userName = null,
        userColor = null;

    // Retrieve chat history
    if (chatHistory.length > 0) {
        conn.sendUTF(JSON.stringify( { type: 'history', data: chatHistory } ));
    }

    // Handle all messages from users
    conn.on('message', function(mes) {
        // console.log(mes);
        if (mes.type === 'utf8') {
            // console.log('2313123');
            var mesStr = mes.utf8Data;
            // If no username yet, set the first message as the username.
            if (userName === null) {
                userName = HTMLEntities(mesStr); // Get username
                userColor = colors.shift(); // Assign random color

                conn.sendUTF(JSON.stringify({ type: 'color', data: userColor }));

                console.log('New user connected: ' + userName);
            }
            // Else, log and broadcast the message
            else {
                // console.log(userName + ': ' + mesStr);

                // Keep history of all sent messages
                var mesData = {
                    time: (new Date()).getTime(),
                    text: mesStr,
                    color: userColor,
                    author: userName
                };
                // console.log(mesData);
                chatHistory.push(mesData);
                chatHistory = chatHistory.slice(-100); // We need only the last 100 messages to be stored.

                // Broadcast received message to all clientList.
                var mesJson = JSON.stringify({
                    type: 'message',
                    data: mesData
                });

                // console.log(clientList);

                for (var r = 0, limit = clientList.length; r < limit; ++r) {
                    clientList[r].sendUTF(mesJson);
                }
            }
        }
    });

    // Close connection
    conn.on('close', function(client) {
        console.log(client);
        if (userName !== null && userColor !== null) {
            console.log('Client ' + client.remoteAddress + ' has disconnected.');

            clientList.splice(index, 1); // Remove client from list
            colors.push(userColor); // Marked the user's color to be available
        }
    });
}
webSocketSrv.on('request', WebSocketOnRequest);