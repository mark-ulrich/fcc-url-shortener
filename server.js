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

// mongoose.connect(process.env.MONGOLAB_URI);

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

  if (!isValidUrl(original_url)) {
    res.json({
      error: "invalid URL"
    });
    return;
  }

  let hostname = original_url.split("/")[2];
  // if (!isValidHostname(hostname)) {
  //   res.json({
  //     error: "invalid Hostname"
  //   });
  //   return;
  // }
  dns.lookup(hostname, (err, address, family) => {
    if (err && err.code === "ENOTFOUND") {
      console.log("NO BUENO");
      res.json({
        error: "invalid Hostname"
      });
    } else {
      console.log("All good");
      res.json({
        original_url,
        short_url
      });
    }
  });

  
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});

const isValidUrl = url => /^https?:\/\/[\w\d\-\.]+[\/\w\d\-]*$/i.test(url);

const isValidHostname = hostname => {
  console.log(hostname);
  dns.lookup(hostname, (err, address, family) => {
    if (err && err.code === "ENOTFOUND") {
      console.log("NO BUENO");
    } else {
      console.log("All good");
    }
  });
};
