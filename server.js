"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var dns = require("dns");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGOLAB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Schema = mongoose.Schema;
const shortUrlSchema = Schema({
  original_url: String,
  short_url: Number
});

const ShortUrlModel = mongoose.model('ShortUrlModel', shortUrlSchema);



app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new", (req, res) => {
  let original_url = req.body.url.trim();
  let short_url = 1000;
  let result;

  if (!isValidUrl(original_url)) {
    res.json({
      error: "invalid URL"
    });
    return;
  }
  
  // does DB already contain the URL?
  ShortUrlModel.findOne({ original_url }, (err, shortUrl) => {
    if (shortUrl !== null) {
      console.log('found', shortUrl);
      res.json({ original_url, short_url: shortUrl.short_url });
    }
    else {
      // validate hostname
      let hostname = original_url.split("/")[2];
      dns.lookup(hostname, (err, address, family) => {
        if (err && err.code === "ENOTFOUND") {   
          res.json({
            error: "invalid Hostname"
          });
        } else {
          // all good, generate id and insert into database
          ShortUrlModel.countDocuments({}, (err, count) => {
            const short_url = count;
            const shortUrl = new ShortUrlModel({ original_url, short_url });
            shortUrl.save((err, data) => {
              if (err) console.log('err');
              console.log('saving', original_url, short_url);
            });
      
            // return JSON data
            res.json({
              original_url,
              short_url
            });
          });
        }
      });
    }
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  
  // fetch URL from DB based on 'short_url'
  let short_url = req.params.short_url;
  ShortUrlModel.findOne({ short_url }, (err, shortUrl) => {
    if (shortUrl) res.redirect(shortUrl.original_url);
    else {
      res.json({ error: "No short url found for given input" });
    }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});

const isValidUrl = url => /^https?:\/\/[\w\d\-\.]+[\/\w\d\-]*$/i.test(url);
