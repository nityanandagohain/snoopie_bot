const express = require('express');
const bodyParser = require('body-parser');
const configFile = require('./config');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});


app.get('/', function (req, res) {
	res.send('Hello world, I am Snoopie a chat bot . Mr. Nityananda Gohain Developed me');
})

/* For Facebook Validation */
app.get('/webhook/', (req, res) => {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'snoopie_dog') {
        res.send(req.query['hub.challenge']);
    } else {
        res.sned('Error: Wrong Tocken');
    }
});

/* Handling all messenges */
app.post('/webhook/', (req, res) => {
    let messaging_events = req.body.entry[0].messaging;
    for(let i=0;i < messaging_events.length; i++){
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        if(event.message && event.message.text){
            let text = event.message.text;
            sendTextToMessage(sender, "Text recieved, echo: " + text.substring(0,200));
        }
    }
    req.sendStatus(200);
});

const token = process.env.FB_PAGE_ACCESS_TOKEN;


sendTextToMessage = (sender, textRecieved) => {
    let messageData = { text: textRecieved}
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            reciepent: {id: sender},
            message: messageData,
        }
    }, (err, response, body)=>{
        if(error){
            console.log("Error sending messages: " + error);
        }else if(response.body.error){
            console.log('Error: ', response.body.error);
        }
    })
}