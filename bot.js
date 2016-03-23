console.log('The bot is running');

var Twit = require('twit');
var config = require('config');

var T = new Twit(config);

var stream = T.stream('user');
stream.on('follow', followed);
stream.on('tweet', tweeted);

setInterval(everyHour, 1000*60*60);

function everyHour(){
  var times = Math.floor((Math.random()*5) + 1);
  var s = 'blub';
  for (var i = 0; i < times-1; i++) {
    s += ' ' + s;
  }
  tweetIt(s);
}

function followed(eventMsg){
  console.log('Someone followed!');
  var name = eventMsg.source.name;
  var screenName = eventMsg.source.screen_name;
  if(screenName != "Lucashtm"){
    tweetIt("@" + screenName + " hey u asshole");
  }else{
    tweetIt("@" + screenName + " hope now u dont kill me of starvation");
  }
}

function tweeted(eventMsg){
  var replyto = eventMsg.in_reply_to_screen_name;
  var fromWho = eventMsg.user.screen_name;
  var text = eventMsg.text;
  console.log("Tweet received!");
  if(replyto === "rodneythefish"){
    var times = Math.floor((Math.random()*5) + 1);
    var s = 'blub';
    for (var i = 0; i < times-1; i++) {
      s += ' ' + s;
    }
    var newTweet = '@' + fromWho + ' ' + s;
    tweetIt(newTweet);
  }
}

function tweetIt(txt){
  var tweet = {
    status: txt
  }

    T.post('statuses/update', tweet, callBack);

  function callBack(err, data, response) {
    if(err){
      console.log("Something went wrong");
    }else {
      console.log("it worked!");
    }
  }
}
