import Ember from 'ember';

export default Ember.Component.extend({

  sendEndpoint: function(newEndpoint) {
    this.sendAction('setEndpoint', this.get('startOrEnd'), newEndpoint);
  },

  actions: {
    incrementEndpoint: function(incrementBy) {
      var incrementedEndpoint = this.get('endpoint') + incrementBy;
      // FIXME: This uses a hacky sendAction pass through in hb-videojs
      this.sendEndpoint(this.get('endpoint') + incrementBy);
    }, 

    setEndpointToCurrentTime: function() {
      this.sendEndpoint(this.get('currentTime'));
    },

    setEndpointToDefault: function() {
      this.sendEndpoint(this.get('defaultEndpoint'))
    }.observes('defaultEndpoint').on('init'),

    setCurrentTimeToEndpoint: function() {
      var endpoint = this.get('endpoint');
      this.sendAction('setCurrentTime', endpoint);
    }
  }
});
