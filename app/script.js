(function() {

    'use strict';

    // DOM References
    var contentDOM = document.querySelector('#content');
    var statusDOM = document.querySelector('#status');
    var inputDOM = document.querySelector('#message');
    
    // Check if browser supports WebSocket
    if ( ! Modernizr.websockets) {
        contentDOM.innerHTML = 'Sorry, but your browser does not support <strong>WebSocket</strong>.';
        contentDOM.style.color = '#FF0000';

        statusDOM.innerHTML = 'Disconnected';
        statusDOM.style.color = '#726B6B';

        inputDOM.style.display = 'none';
    } else {

        var myColor = null;
        var myAlias = null;

        // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        // Open connection to chat server
        var conn = new WebSocket('ws://127.0.0.1:1337');
        
        /**
         * Function: onopen
         */
        conn.onopen = function() {
            statusDOM.innerHTML = 'Connected';
            statusDOM.style.color = '#00FF00';
            // Tell the user to enter a name first
            inputDOM.removeAttribute('disabled');
            inputDOM.setAttribute('placeholder', 'Enter your alias name');
        };

        /**
         * On error listener
         */
        conn.onerror = function() {
            contentDOM.innerHTML = 'It seems there is a problem with your connection to the server.';
            contentDOM.style.color = '#FF0000';
            statusDOM.innerHTML = 'Connection Error';
            statusDOM.style.color = '#FF0000';
        };

        /**
         * On message listener
         *
         * @param {String} mes
         */
        conn.onmessage = function(mes) {
            
            var json = null;
            
            try {
                json = JSON.parse(mes.data);
            } catch(err) {
                console.log('Invalid JSON Format: ' + mes.data);
                return;
            }

            switch(json.type) {
            case 'color':
                myColor = mes.data;

                inputDOM.removeAttribute('disabled');
                inputDOM.removeAttribute('placeholder');
            break;
            case 'history': // Display previous messages
                for (var r = 0, limit = json.data.length; r < limit; ++r) {
                    AppendMessage(
                        json.data[r].author,
                        json.data[r].text,
                        json.data[r].color,
                        new Date(json.data[r].time)
                    );
                }
            break;
            case 'message': // Display new message
                inputDOM.removeAttribute('disabled');

                AppendMessage(
                    json.data.author,
                    json.data.text,
                    json.data.color,
                    new Date(json.data.time)
                );
            break;
            default:
                console.log('Unrecognized JSON type');
            break;
            }
        };

        inputDOM.onkeydown = OnKeyDown;
    }

    /**
     * Listen for keypress and send message if Enter key is pressed.
     *
     * @param {Object} e - Key Input Object
     */
    function OnKeyDown(e) {
        // On enter, send the message
        if (e.keyCode === 13)
            SendMessage()
    }

    /**
     * Sends the message via websocket.
     */
    function SendMessage() {

        var msg = inputDOM.value;

        if ( ! msg.length)
            return;            

        conn.send(msg);

        inputDOM.value = '';
        inputDOM.setAttribute('disabled', 'disabled');

        if (myAlias === null)
            myAlias = msg;
    }

    /**
     * Add message to the chat window
     *
     * @param {String} author
     * @param {String} message
     * @param {String} color
     * @param {String} dt - DateTime Object
     */
    function AppendMessage(author, message, color, dt) {
        contentDOM.innerHTML = contentDOM.innerHTML + ('<p><span style="color:' + color + '">' + author + '</span> @ '
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');
    }
})();