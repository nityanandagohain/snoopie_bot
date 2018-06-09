const express = require('express');
const bodyParser = require('body-parser');
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
app.post('/webhook', (req, res) => {
    console.log(req.body);
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                if (event.message && event.message.text) {
                    sendMessage(event);
                }
            });
        });
        res.status(200).end();
    }
});