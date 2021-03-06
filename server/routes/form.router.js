var express = require('express');
var router = express.Router();
var pool = require('../modules/pool.js');

router.post('/form', function (req, res) {
    var grow = req.body;
    // set tag column value to null array
    var tagsArray = [];
    if (grow.mentor){
        tagsArray.push('volunteer');
    } if (grow.mentee){
        tagsArray.push('entrepreneur');
    }
    var defaultTags = '{' + tagsArray + '}';
    pool.connect(function (error, client, done) {
        if (error) {
            console.log(error);
            res.sendStatus(404);
        } else {
            var queryString = 'INSERT INTO prospects (firstname, lastname, email, phone, linkedin, website, company, title, referral, mentor, mentee, involvement, howhelp, experience, ecosystem, employees, revenue, distribution, story, tags, anythingelse) VALUES ($1, $2, $3, $4, $5, $6 , $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21);';
            var items = [grow.firstname, grow.lastname, grow.email, grow.phone, grow.linkedin, grow.website, grow.company, grow.title, grow.referral, grow.mentor, grow.mentee, grow.involvement, grow.howhelp, grow.experience, grow.ecosystem, grow.employees, grow.revenue, grow.distribution, grow.story, defaultTags, grow.anythingelse];
            client.query(queryString, items, function (queryErr, resultObj) {
                done();
                if (queryErr) {
                    console.log(queryErr);
                    res.sendStatus(500);
                } else {

                    res.sendStatus(201);
                }
            });
        }
    });
}); //end post route

module.exports = router;