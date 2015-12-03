var express = require('express'),
    request = require('request'),
    OAuth = require('oauth'),
    qs = require('querystring');

var app = express();

defaults = {
    client_id: 'sTCD7VRInaT5PRBNuAzuBV89l0CAh-UJ',
    client_secret: 'bgtgSjstO3nBxOCB5vAYu692fATU5Jq4E632OOb9',
    server_token: 'DJcKdA14iA7s1TlvzaWmck3j2OJUkByF7DrtnpUH',
    redirect_uri: 'http://localhost:7000/submit',
    name: 'Sample app',
    base_url: 'https://sandbox-api.uber.com/',
    authorize_url: 'https://login.uber.com/oauth/authorize',
    access_token_url: 'https://login.uber.com/oauth/token'
}

oauth2 = new OAuth.OAuth2(
    defaults.client_id,
    defaults.client_secret,
    '',
    defaults.authorize_url,
    defaults.access_token_url
);


var access_token = '';
var refresh_token = '';

//var scopes = ["request", "history_lite", "profile", "history"];
var scopes = ['request'];

app.get('/', function (req, res) {
    var url = oauth2.getAuthorizeUrl({
        'response_type': 'code',
        'redirect_uri': defaults.redirect_uri,
        'scope': scopes.join(',')
    });
    
    res.redirect(url);

});

app.get('/submit', function(req, res) {
    var code = req.query.code;
    oauth2.getOAuthAccessToken(code,
        {
            client_id: defaults.client_id,
            client_secret: this.defaults.client_secret,
            redirect_uri: this.defaults.redirect_uri,
            grant_type: 'authorization_code'
        }, function (err, access, refresh) {
            if (err) {
                console.log(err);
            } else {
                access_token = access;
                refresh_token = refresh;
                res.redirect('/request');
            }
        }
    );
});

app.get('/request', function(req, res) {
    var local_callback = function(err, data, r) {
        if (err) {
            console.log(err);
        } else {
            res.send(data.body);
        }
    }

    var local_request = function(err, data, r) {
        if (err) {
            console.log(err);
        } else {
            var product_id = data.body.products[0].product_id;
            var params = {
                'product_id': product_id,
                'start_latitude': 37.781955,
                'start_longitude': -122.402367
            }
            request_ride(params, local_callback);
        }
    }

    var params = {
            'latitude': 37.781955,
            'longitude': -122.402367
    }

    get_products(params, local_request);
    //get_products_test(params, local_callback);

});

app.get('/products', function(req, res) {
    var local_callback = function(err, data, r) {
        if (err) {
            console.log(err);
        } else {
            res.send(data.body);
        }
    }
    var params = {
            'latitude': 37.781955,
            'longitude': -122.402367
    }

    get_products(params, local_callback);
});


var get_products = function(params, callback) {
    var base_url = 'https://sandbox-api.uber.com/v1/products';

    var url = base_url + '?access_token=' + access_token + '&' + qs.stringify(params);
    request.get({url: url, json: true}, callback);
}

var request_ride = function(params, callback) {
    var base_url = 'https://sandbox-api.uber.com/v1/requests';
    var p = {
        url: base_url,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer '+access_token
        },
        body: params
    }


    //var url = base_url + '?access_token=' + access_token + '&' + qs.stringify(params);
    //request.post({url: url, json: true}, callback);
    request.post(p, callback);
}

var get_products_test = function(p, callback) {
    var params = {
        url: 'https://sandbox-api.uber.com/v1/products',
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer '+access_token
        },
        body: p
    }
    request.get(params, callback);
}


var server = app.listen(7000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
