var express = require('express');
var request = require('request');
var NodeCache = require('node-cache');
var cache = new NodeCache();
var router = express.Router();
var gmHost = "http://gmapi.azurewebsites.net";
var options = {
    method: 'POST',
    json: {
        "responseType": "JSON"
    }
};

router.get('/vehicles/:id', function (req, res, next) {

    //TODO validate id using express-validation

    //request options
    options.url = gmHost + "/getVehicleInfoService";
    options.json.id = req.params.id;

    //check cache first
    var output = cache.get('V_' + req.params.id);

    if (output === undefined) {
        request(options, function (error, response, body) {
            var doorCount = (body.data.fourDoorSedan.value) ? 4 : (body.data.twoDoorCoupe.value) ? 2 : 0; //set 0 if both are false
            //data output format, can be moved to global if required in other places
            output = {
                //TODO use object-mapper to map the values
                "vin": body.data.vin.value,
                "color": body.data.color.value,
                "doorCount": doorCount,
                "driveTrain": body.data.driveTrain.value
            }

            //load it into cache and set expiry
            cache.set('V_' + req.params.id, output, 60);
        })
    }

    res.json(output);
    res.end();
});

router.get('/vehicles/:id/doors', function (req, res, next) {

    //TODO validate id using express-validation

    //request options
    options.url = gmHost + "/getSecurityStatusService";
    options.json.id = req.params.id;

    //check cache first
    var data = cache.get('VD_' + req.params.id);
    var output = [];

    if (data === undefined) {
        request(options, function (error, response, body) {
            var values = body.data.doors.values;
            values.forEach(function (e) {
                output.push({
                    //TODO use object-mapper to map the values
                    location: e.location.value,
                    locked: Boolean(e.locked.value)
                })
            })

            //load it into cache and set expiry
            cache.set('VD_' + req.params.id, output, 60);
        })
    } else {
        output = data;
    }

    res.json(output);
    res.end();
});

router.get('/vehicles/:id/fuel', function (req, res, next) {
    options.url = gmHost + "/getEnergyService";
    options.json.id = req.params.id;
    request(options, function (error, response, body) {
        var percent = {
            percent: body.data.tankLevel.value
        };
        res.json(percent);
        res.end();
    })
});

router.get('/vehicles/:id/battery', function (req, res, next) {
    options.url = gmHost + "/getEnergyService";
    options.json.id = req.params.id;
    request(options, function (error, response, body) {
        var percent = {
            percent: body.data.batteryLevel.value
        };
        res.json(percent);
        res.end();
    })
});

router.post('/vehicles/:id/engine', function (req, res, next) {
    options.url = gmHost + "/actionEngineService";
    if (req.body.action !== 'START' && req.body.action !== 'STOP') {
        res.statusCode = 400;
        res.json({
            status: "Invalid action"
        });
        res.end();
    } else {
        options.json.id = req.params.id;
        options.json.command = (req.body.action === 'START') ? 'START_VEHICLE' : 'STOP_VEHICLE';
        request(options, function (error, response, body) {
            console.log(body);
            var status = {
                status: body.actionResult.status
            };
            res.json(status);
            res.end();
        })
    }
});

module.exports = router;
