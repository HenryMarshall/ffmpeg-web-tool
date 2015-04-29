import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    fileLoaded: function(file) {
      console.log("file.name: ",file.name);
      debugger;
    }
  }
});
