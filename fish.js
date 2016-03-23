console.log("running");

var Twit = require('twit');
var config = require('config');

var T = new Twit(config);

var pH = 6.8;
var temperature = 20;
var schedule = ['8:00', '16:17', '20:00'];
var human = '@Lucashtm';
var cont = 0;

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
  this.day = this.time.getDay();

  this.checkPH = function(pH, username, in_reply_to_id){
    var add = '';
    if(!in_reply_to_id){
      add += formatTime(this.time);
    }
    if(pH < 6.8){
      this.reply(username, 'these microorganisms are cool'+' '+add, in_reply_to_id);
    }else if(in_reply_to_id){
      this.reply(username, 'everything alright here, bored as always.', in_reply_to_id);
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
        this.rodneyFeeded(i);
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
    if(temperature >= 15 || temperature <= 24){
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
      if(eventMsg.text.indexOf('water') != -1 || eventMsg.text.indexOf('dirty') != -1){
        this.checkPH(pH, username, tweet_to_reply);
      }

      if (eventMsg.text.indexOf('hungry') != -1 || eventMsg.text.indexOf('food') != -1) {
        this.checkSchedule(username, tweet_to_reply);
      }

      if(eventMsg.text.indexOf('hot') != -1 || eventMsg.text.indexOf('cold') != -1 || eventMsg.text.indexOf('temperature') != -1){
        this.checkTemperature(temperature, username, tweet_to_reply);
      }
    }else{
      fs.writeFile('reply.json', json);
    }
  }

  //check if day changed to reset the feed flags
  this.resetScheduleCheck = function(){
      if(this.day != this.time.getDay()){
        this.day = time.getDay();
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
  aquarium.mentioned(eventMsg);
}

function followed(eventMsg){
  aquarium.followed(eventMsg);
}

setInterval(updateData, 1000*60*30);

function updateData(){
  console.log('called');
  pH = (Math.random()*2.0) + 6.0;
  temperature = Math.floor((Math.random()*20) + 10);
  aquarium.checkEverything();
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
  var day = this.time.getDay();
  var month = this.time.getMonth()+1;
  var year = this.time.getFullYear();
  var hour = this.time.getHours();
  var minute = this.time.getMinutes();
  if(hour < 10){
    hour = '0'+hour;
  }
  if(minute < 10){
    minute = '0'+minute;
  }
  return '('+month+'/'+day+'/'+year+' '+hour+':'+minute+')';
}
