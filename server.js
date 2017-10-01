// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var validUrl = require('valid-url');
var shortId = require('shortid');

var dburl = "mongodb://shortener:shorturl@ds155684.mlab.com:55684/url-shortener-sites";

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get('/new/:url(*)',function(req,res){
  var url = req.params.url;
  if(validUrl.isUri(url))
    {
      mongo.connect(dburl,function(err,db){
        if(err)
          {
            res.send('connection error');
            return console.log(err);
          }
        else
          {
            var urls = db.collection('urls');
            var short = shortId.generate();
            urls.insert([{url: url, short: short}], function(){
              var data = {
                        original_url: url,
                        short_url: 'http://'+req.headers['host']+'/'+short
                    }
              db.close();
              res.json(data);
            })
          }
      });
      
    }
  else
    {
      res.json(
        {
            error:'Not actually a valid url'
        }
      )
    }
});

app.get('/:id', function(req,res) {
  var id = req.params.id;
  mongo.connect(dburl,function(err,db){
    if(err){
      res.send('connection error');
            return console.log(err);
    } else {
      var urls = db.collection('urls');
      urls.find({short:id}).toArray(function(err, docs) {
        if(err) {
          res.send('error');
          return console.log(err);
        } else {
          if(docs.length > 0)
            {
              var url = docs[0].url;
              db.close();
              res.redirect(url);
            } else 
            {
              res.send("Not found");
            }
        }
      });
    }
  });
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
