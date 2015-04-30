import Ember from 'ember';

export default Ember.Component.extend({
  endpointTime: 0,

  actions: {
    "setEndpointToCurrentTime": function() {
      debugger;
      var currentTime = this.get('currentTime');
      this.set('endpointTime', currentTime);
    }
  }
});
