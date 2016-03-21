console.log("running");

var redis = require('redis');
var client = redis.createClient();

var Twit = require('twit');
var config = require('config');

var T = new Twit(config);

var listener = T.stream('user');
listener.on('tweet', mentioned);
listener.on('follow', followed);

//function that is triggered when someone follows the user
function followed(eventMsg){
  console.log('someone followed');
  var username = eventMsg.source.screen_name;
  if(username !== 'rodneythefish' && username !== 'Lucashtm'){
    tweetIt('@'+username+' hope you are not an asshole like my human.');
  }else if(username === 'Lucashtm'){
    tweetIt('@'+username+' hope now you dont kill me of starvation.');
  }
}

//function that is triggered when someone mentions the user
function mentioned(eventMsg){
  var fs = require('fs');
  var username = eventMsg.user.screen_name;
  var tweet = '@'+username;
  var tweet_to_reply = eventMsg.id_str;
  var json = JSON.stringify(eventMsg, null, 2);
  
  if(eventMsg.in_reply_to_screen_name === "rodneythefish" || eventMsg.text.indexOf('@rodneythefish') != -1){
    fs.writeFile('tweet.json', json);
    console.log('tweet received');

    if(eventMsg.text.indexOf('hello') != -1){
      tweet += ' hello.';
    }

    if((eventMsg.text.indexOf('water') != -1 || eventMsg.text.indexOf('dirty')) != -1){
      if(checkDirty()){
        tweet += ' everything is alright here, bored as always.';
      }else {
        tweet += ' im breathing my own piss.';
      }
    }

    if(tweet === '@'+username){
      tweet += ' screw yourself.'
    }
    tweetIt(tweet, tweet_to_reply);
  }else{
    fs.writeFile('reply.json', json);
  }
}

//This function tweets any text
function tweetIt(text, in_reply_to_id){
  var tweet = {
    status: text,
    in_reply_to_status_id: in_reply_to_id
  }

  T.post('statuses/update', tweet, callBack);

  function callBack(err, data, response){
    if(err){
      console.log(err);
    }
  }
}

function checkDirty(){
  var pH;
  client.get("pH", function(err, reply){
    pH = parseInt(reply, 10);
  });
  return pH > 6.8;
}

function checkFoodTime(){
  var schedule;
  var thereIsFood;
  var time = new Date();
  var now = time.getHours() + ':' + time.getMinutes();
  client.get('food', function(err, reply){
    thereIsFood = reply;
  })
  client.hkeys('foodTime', function(err, replies){
    schedule = replies;
  });
  for (var i = 0; i < schedule.length; i++) {
    if(schedule[i] <= now && !thereIsFood){
      return true;
    }
  }
  return false;
}
