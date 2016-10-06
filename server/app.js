const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');

const app = express();
const router = express.Router();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


const FIREBASE_AUTHORIZATION_KEY = 'AIzaSyCb9ysSZxINYbX6QjruMT4wF85Mywvxi2U';
let SUBSCRIPTIONS = {};


let indexHandler = function(req, res) {
    let context = {
        SUBSCRIPTIONS: SUBSCRIPTIONS
    };

    res.render('index', context);
}

let subscribeHandler = function(req, res) {
    if (!req.body.subscription) {
        res.status(400)
        res.send({ error: 'JSON with subscription node is required.' });

        return;
    }

    let subscription = req.body.subscription;
    SUBSCRIPTIONS[subscription] = {
        date: new Date()
    };

    res.status(201);
    res.send({ status: 'OK' });
}

let sendMessageHandler = function(req, res) {
    let registrationId = req.body['registration-id'] ;
    let requestBody = {
        registration_ids: [registrationId]
    };

    let request = http.request({
        protocol: 'http:',
        host: 'android.googleapis.com',
        method: 'POST',
        path: '/gcm/send',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${FIREBASE_AUTHORIZATION_KEY}`
        },

    }, function(response) {
        let data = '';
        let context = {}

        if (response.statusCode == 401) {
            context.error = true;
            context.errorMsg = 'Something is wrong with Firebase authorization key.';
            context.badKey = true;
            res.render('index', context);

            return;
        }

        response.on('data', function (chunk) {
            data += chunk;
        });

        response.on('end', function () {
            let body = JSON.parse(data);

            if (body.success) {
                context.success = true;
                context.successMsg = `Successfully send message to ${registrationId}`;

            } else {
                context.error = true;
                context.responseError = true;

                if (body.results[0].error === 'InvalidRegistration') {
                    context.errorMsg = `This ${registrationId} is invalid app registration id.`
                } else {
                    context.errorMsg = body.results[0].error;
                }
            }
            res.render('index', context);
        });
    });

    request.write(JSON.stringify(requestBody));
    request.end();
}

router.get('/', indexHandler);
router.post('/', sendMessageHandler);
router.post('/subscribe', subscribeHandler);


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3010, function() {
    console.log('app started');
});
