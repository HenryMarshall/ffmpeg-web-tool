import Ember from 'ember';

export default Ember.Component.extend({

  sendEndpoint: function(newEndpoint) {
    var affectedEndpoint = (this.get('startOrEnd') === "Start") ? 
                            "startEndpoint" : 
                            "endEndpoint";
    this.sendAction('setEndpoint', affectedEndpoint, newEndpoint);
  },

  actions: {
    incrementEndpoint: function(incrementBy) {
      var incrementedEndpoint = this.get('endpoint') + incrementBy;
      this.sendEndpoint(this.get('endpoint') + incrementBy);
    }, 

    setEndpointToCurrentTime: function() {
      this.sendEndpoint(this.get('currentTime'));
    },

    setEndpointToDefault: function() {
      this.sendEndpoint(this.get('defaultEndpoint'));
    }.observes('defaultEndpoint').on('init'),

    setCurrentTimeToEndpoint: function() {
      var endpoint = this.get('endpoint');
      this.sendAction('setCurrentTime', endpoint);
    }
  }
});
