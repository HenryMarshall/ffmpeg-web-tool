import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    changePlaybackRate: function(rateChange) {
      var newPlaybackRate = this.get('playbackRate') + rateChange;
      if (0 < newPlaybackRate && newPlaybackRate <= 10) {
        this.set('playbackRate', newPlaybackRate);
      }
    }
  }
});
