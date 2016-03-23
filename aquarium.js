var redis = require('redis')
var client = redis.createClient();
module.exports = {
  Aquarium: function (){
      this.dirtLevel = 0;
      this.isHungry = false;
      this.schedule = [];
      this.update();

      this.update = function(){
        client.get("dirtLevel", function(err, reply){
          dirtLevel = reply;
        });
        client.get("isHungry", function(err, reply){
          isHungry = reply;
        });
        client.hkeys("schedule", function(err, replies){
          schedule = replies;
        });
      }

      this.quit = function(){
        client.quit();
      }
      }
    }
}
