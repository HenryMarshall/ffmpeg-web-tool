import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    playSegment: function() {
      this.sendAction('action', this.get('loopSegment'));
    }
  }
});
