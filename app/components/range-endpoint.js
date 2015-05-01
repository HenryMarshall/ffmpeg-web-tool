import Ember from 'ember';

export default Ember.Component.extend({

  actions: {
    incrementEndpoint: function(incrementBy) {
      var newEndpoint = this.get('endpoint') + incrementBy;
      // FIXME: This uses a hacky sendAction pass through in hb-videojs
      this.sendAction('setEndpoint', this.get('startOrEnd'), newEndpoint);
    }, 

    setEndpointToCurrentTime: function() {
      var currentTime = this.get('currentTime');
      this.set('endpoint', currentTime);
    },

    setCurrentTimeToEndpoint: function() {
      var endpoint = this.get('endpoint');
      this.sendAction('setCurrentTime', endpoint);
    },

    setEndpointToDefault: function() {
      this.set('endpoint', Ember.computed.oneWay('defaultEndpoint'));
    }.observes('defaultEndpoint').on('init')
  }
});
