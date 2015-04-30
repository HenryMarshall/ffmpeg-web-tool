import Ember from 'ember';

export default Ember.Component.extend({
  endpointTime: 0,

  actions: {
    setEndpointToCurrentTime: function() {
      var currentTime = this.get('currentTime');
      this.set('endpointTime', currentTime);
    },

    incrementEndpoint: function(incrementBy) {
      var newEndpoint = this.get('endpointTime') + incrementBy;

      // All legal currentTime must be bounded by 0 and the duration.
      newEndpoint = newEndpoint < 0 ? 0 : newEndpoint;
      var duration = this.get('duration');
      newEndpoint = newEndpoint > duration ? duration : newEndpoint;

      this.set('endpointTime', newEndpoint);
    }
  }
});
