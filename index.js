'use strict'

const
    express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    token = process.env.FB_PAGE_ACCESS_TOKEN,
    verify_token = process.env.FB_PAGE_VERIFY_TOKEN;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode',
        server.address().port, app.settings.env);
});


app.get('/', function (req, res) {
    res.send('Hello world, I am Snoopie a chat bot . Mr. Nityananda Gohain Developed me');
})

/* For Facebook Validation */
app.get('/webhook/', (req, res) => {

    let mode = req.query['hub.mode'];
    let tokenRecieved = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    //check if token and mode are in the query string of the request
    if (mode && tokenRecieved) {
        if (mode == 'subscribe' && tokenRecieved === verify_token) {
            console.log("Webhook verified");
            res.status(200).send(challenge);
        } else {
            // respont with 403 Forbidden if token doesn't match
            res.sendStatus(403);
        }
    }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {

    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Get the webhook event. entry.messaging is an array, but 
            // will only ever contain one event, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            //check if the event is a message or postback and pass it to appropiate function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

//Handles message events
function handleMessage(sender_psid, received_message) {

    let response;

    if (received_message.text) {
        //Payload for basic text message
        response = {
            "text": `You send the message: "${received_message.text}". Now send me an image!`
        }
    } else if (received_message.attachments) {
        //Get the url of the message attchment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    //send the response message
    callSendAPI(sender_psid, response);
}

//Handles message postback events
function handlePostback(sender_psid, received_postback) {

    let response;

    //Get the payload for the postback 
    let payload = received_postback.payload;

    //set the response based on payload
    if (payload == 'yes') {
        response = { "text": "Thanks!" }
    } else if (payload == 'no') {
        response = { "text": "Oops, try sending another image." }
    }

    callSendAPI(sender_psid, response)
}

//Send response message via the SEND api
function callSendAPI(sender_psid, response) {

    //construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    //send http request to messenger
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": token },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log("message sent!");
        } else {
            console.log("Unable to send message" + err);
        }
    });
}