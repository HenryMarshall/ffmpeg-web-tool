import Ember from 'ember';

export default Ember.Component.extend({
  controls: true,
  currentTime: 0,
  height: 400,
  width: 600,
  loop: false,
  muted: false,
  playbackRate: 1,
  volume: 0,
  isPaused: true,

  startEndpoint: 0,
  endEndpoint: 0,

  actions: {
    setEndpoint: function(startOrEnd, newEndpoint) {
      var legalEndpoint = this.ensureEndpointIsLegal(newEndpoint);
      var affectedEndpoint = startOrEnd === "Start" ? 
                                "startEndpoint" : 
                                "endEndpoint"
      this.set(affectedEndpoint, legalEndpoint);
    }
  },

  ensureEndpointIsLegal: function(endpoint) {
    if (endpoint < 0) {
      return 0;
    } else if (this.get('duration') < endpoint) {
      return this.get('duration');
    } else {
      return endpoint;
    }
  }
});
