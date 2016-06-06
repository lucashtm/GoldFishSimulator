console.log("running");

var Twit = require('twit');
var config = require('config');
var redis = require('redis_connector');
var connector = new redis.Redis();

var T = new Twit(config);

connector.redisGetData();
var pH;
var temperature;
var schedule = ['','',''];
var human;

function AquariumManager(human, schedule){

  this.human = human;
  if(schedule.length == 3){
    this.schedule = schedule;
  } else {
    console.log("Exception no tamanho da schedule! Um peixe deve comer 3 vezes por dia.");
    return;
  }
  this.scheduleCheck = [false, false, false];
  this.time = new Date();
  this.day = this.time.getDate();

  this.checkPH = function(pH, username, in_reply_to_id){
    var add = '';
    if(!in_reply_to_id){
      add += formatTime(this.time);
    }
    if(pH < 6.8){
      this.reply(username, 'these microorganisms are disturbing me'+' '+add, in_reply_to_id);
    }else if(in_reply_to_id){
      this.reply(username, 'everything clean.', in_reply_to_id);
    }
  }

  this.checkSchedule = function(username, in_reply_to_id){
    var add = '';
    if(!in_reply_to_id){
      add += formatTime(this.time);
    }

    var now = this.time.getHours() + ':' + this.time.getMinutes();
    var got = false;
    for (var i = 0; i < schedule.length; i++) {
      if(now >= this.schedule[i] && !this.scheduleCheck[i]){
        this.reply(username, 'please feed me'+' '+add, in_reply_to_id);
        return;
      }
    }
    if(in_reply_to_id){
      this.reply(username, ' Im on a diet.', in_reply_to_id);
    }
  }

  this.checkTemperature = function(temperature, username, in_reply_to_id){
    var add = '';
    if(!in_reply_to_id){
      add += formatTime(this.time);
    }
    if(temperature >= 15 && temperature <= 24){
      if(in_reply_to_id){
        this.reply(username, 'everything is fine', in_reply_to_id);
      }
    }else if(temperature < 15){
      this.reply(username, 'Rodney is frozen solid.'+' '+add, in_reply_to_id);
    }else{
      this.reply(username, 'Do you like hardboiled fish?'+' '+add, in_reply_to_id);
    }
  }

  this.checkEverything = function(){
    this.checkPH(pH, this.human, null);
    this.checkSchedule(this.human, null);
    this.checkTemperature(temperature, this.human, null);
  }

  this.reply = function(account, text, in_reply_to_id){
    tweetIt(account+" "+text, in_reply_to_id);
  }

  this.followed = function(eventMsg){
    console.log('someone followed');
    var username = '@'+eventMsg.source.screen_name;
    this.reply(username, 'Hi I\'m a twitter bot, wich means i\'m not very smart so I will send you other tweets with some instructions:', null);
    this.reply(username, 'Tweet something with the words \"water\" or \"dirty\" to check if the water is dirty or not', null);
    this.reply(username, 'Tweet something with the words \"food\" or \"hungry\" to check if im hungry or not', null);
    this.reply(username, 'Tweet something with the words \"hot\", \"cold\" or \"temperature\" to check the water temperature', null);
  }

  this.mentioned = function(eventMsg){
    var fs = require('fs');
    var username = '@'+ eventMsg.user.screen_name;

    var tweet_to_reply = eventMsg.id_str;
    var json = JSON.stringify(eventMsg, null, 2);

    if(eventMsg.in_reply_to_screen_name === "rodneythefish" || eventMsg.text.indexOf('@rodneythefish') != -1){
      fs.writeFile('tweet.json', json);
      console.log('tweet received');
      var valid = false;
      if(eventMsg.text.indexOf('water') != -1 || eventMsg.text.indexOf('dirty') != -1){
        this.checkPH(pH, username, tweet_to_reply);
        valid = true;
      }

      if (eventMsg.text.indexOf('hungry') != -1 || eventMsg.text.indexOf('food') != -1) {
        this.checkSchedule(username, tweet_to_reply);
        valid = true;
      }

      if(eventMsg.text.indexOf('hot') != -1 || eventMsg.text.indexOf('cold') != -1 || eventMsg.text.indexOf('temperature') != -1){
        this.checkTemperature(temperature, username, tweet_to_reply);
        valid = true;
      }

      if(!valid){
        this.reply(username, 'you have to follow the instructions for me to tweet something with a meaning', tweet_to_reply);
      }
    }else{
      fs.writeFile('reply.json', json);
    }
  }

  //check if day changed to reset the feed flags
  this.resetScheduleCheck = function(){
    if(this.day != this.time.getDate()){
      this.day = time.getDate();
      this.scheduleCheck = [false, false, false];
    }
  }

  this.setSchedule = function(schedule){
    this.schedule = schedule;
  }

  this.rodneyFeeded = function(index){
      this.scheduleCheck[index] = true;
  }
}

var listener = T.stream('user');
var aquarium = new AquariumManager(human, schedule);

listener.on('tweet', mentioned);
listener.on('follow', followed);

function mentioned(eventMsg){
  updateData();
  aquarium.mentioned(eventMsg);
}

function followed(eventMsg){
  aquarium.followed(eventMsg);
}

setInterval(connector.redisGetData, 1000*30);
setInterval(checkData, 1000*61*30);
function checkData(){
  updateData();
  aquarium.checkEverything();
}

function updateData(){
  var data = connector.getData();
  pH = data.pH;
  temperature = data.temperature;
  schedule = [data.schedule.first, data.schedule.second, data.schedule.third];
  aquarium.human = data.human;
  aquarium.scheduleCheck = [parseBoolean(data.feed.first), parseBoolean(data.feed.second), parseBoolean(data.feed.third)];
  if(aquarium.day != aquarium.time.getDate()){
    aquarium.resetScheduleCheck();
  }
}

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

function formatTime(time){
  var day = time.getDate();
  var month = time.getMonth()+1;
  var year = time.getFullYear();
  var hour = time.getHours();
  var minute = time.getMinutes();
  if(hour < 10){
    hour = '0'+hour;
  }
  if(minute < 10){
    minute = '0'+minute;
  }
  return '('+month+'/'+day+'/'+year+' '+hour+':'+minute+')';
}

function parseBoolean(text){
  return text === "true" || text === "True" || text === "TRUE";
}
