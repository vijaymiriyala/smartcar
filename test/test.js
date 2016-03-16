var chai = require('chai');
var request = require('supertest');

describe('Routing', function () {
    var url = 'http://localhost:3000';
    it('is should successfully get vehicle details', function (done) {
        request(url)
            .get('/vehicles/1234')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                done();
            });
    });

    it('is should successfully get doors', function (done) {
        request(url)
            .get('/vehicles/1234/doors')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                done();
            });
    });
});