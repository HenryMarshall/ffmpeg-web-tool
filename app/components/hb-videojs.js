import Ember from 'ember';
import videojs from 'videojs';

export default Ember.Component.extend({
  concatenatedProperties: ['playerPropertyBindings'],

  playerEvents: {
    durationchange : 'durationChange',
    loadedmetadata : 'loadedMetadata',
    play           : 'play',
    pause          : 'pause',
    seeked         : 'seeked',
    timeupdate     : 'timeUpdate',
    volumechange   : 'volumeChange'
  },

  playerPropertyBindings: [
    'autoplay',
    'controls',
    'height',
    'loop',
    'muted',
    'playbackRate',
    'poster',
    'preload',
    'volume',
    'width'
  ],

  // hbaughman modifications

  // added `pause` to the list of playerEvents
  // added `this.set('player', player);` to `_didInitPlayer()`

  playDidChange: Ember.on('play', function() {
    this.set('isPaused', false);
  }),

  pauseDidChange: Ember.on('pause', function() {
    this.set('isPaused', true);
  }),

  actions: {
    play: function() {
      var player = this.get('player');
      player.play();
    },

    pause: function() {
      var player = this.get('player');
      player.pause();
    },

    setCurrentTime: function(newCurrentTime) {
      var player = this.get('player');
      player.currentTime(newCurrentTime);
    },

    setEndpoint: function(affectedEndpoint, newEndpoint) {
      this.sendAction('setEndpoint', affectedEndpoint, newEndpoint);
      this.maintainPlayerEndpointLockstep(affectedEndpoint, newEndpoint);
    },

    playSegment: function(loopSegment) {
      this.set('isPlayingSegment', true);
      this.set('isSegmentLooping', loopSegment);

      this.send('setCurrentTime', this.get('startEndpoint'));
      this.send('play');
    }
  },

  stopSegment: function() {
    this.set('isPlayingSegment', false);
    this.set('isSegmentLooping', false);
  },

  watchForEndOfSegment: function() {
    if (this.get('isPlayingSegment')) {
      
      var currentTime = this.get('currentTime');

      // If before the segment, stop playing segment (sanity check)
      if (currentTime < this.get('startEndpoint') || currentTime < 0) {
        this.stopSegment();
      } 
      else {
        // If you don't check if player is seeking, this will redirect to
        // `startEndpoint` before currentTimeDidChangeViaSeeked will trigger.
        // This prevents it from calling stopSegment.
        var isPlayerSeeking = this.get('player').seeking();
        if (currentTime >= this.get('endEndpoint') && !isPlayerSeeking) {
          if (this.get('isSegmentLooping')) {
            this.send('setCurrentTime', this.get('startEndpoint'));
          }
          else {
            this.stopSegment();
            this.send('pause');
          }
        }
      }
    }
  }.observes('currentTime').on('init'),

  // If the paused player is looking at the endpoint when it is changed, update
  // the currentTime to keep it in lockstep. This is helpful when fine-tuning
  // the start/end of a clip.
  maintainPlayerEndpointLockstep: function(affectedEndpoint, newEndpoint) {
    var player = this.get('player');
    var previouslyInLockstep = player.currentTime() === 
                                  this.get(affectedEndpoint);
    if (player.paused() && (previouslyInLockstep || player.seeking())) {
      this.send('setCurrentTime', newEndpoint);
    }
  },

  currentTimeDidChangeViaSeeked: Ember.on('seeked', function(player) {
    this.set('currentTime', player.currentTime());
    if (this.get('currentTime') !== this.get('startEndpoint')) {
      this.stopSegment();
    }
  }),

  currentTimeDidChangeViaTimeUpdate: Ember.on('timeUpdate', function(player) {
    this.set('currentTime', player.currentTime());
  }),

  // vanilla ivy-videojs

  durationDidChange: Ember.on('durationChange', function(player) {
    this.set('duration', player.duration());
  }),

  ready: function() {
    return this.get('_readyPromise');
  },

  volumeDidChange: Ember.on('volumeChange', function(player) {
    this.set('volume', player.volume());
  }),

  _applyPlayerProperty: function(player, property, newValue) {
    var method = player[property];

    if (method) {
      var oldValue = method.call(player);

      if (oldValue !== newValue) {
        method.call(player, newValue);
      }
    }
  },

  _applyPlayerPropertyBindings: function(player, playerPropertyBindings) {
    Ember.EnumerableUtils.forEach(playerPropertyBindings, function(property) {
      if (property in this) {
        var propertyValue = this.get(property);

        // If the property is null or undefined, read the value from the player
        // as a default value. This way we automatically pick up defaults from
        // video.js without having to specify them here.
        if (Ember.isNone(propertyValue)) {
          propertyValue = player[property].call(player);
          this.set(property, propertyValue);
        }

        this._setupPlayerPropertyBindingObservation(player, property);

        // Set the initial player value.
        this._applyPlayerProperty(player, property, propertyValue);
      }
    }, this);
  },

  _applyPropertiesToPlayer: function(player) {
    var playerPropertyBindings = this.playerPropertyBindings;
    if (playerPropertyBindings.length) {
      this._applyPlayerPropertyBindings(player, playerPropertyBindings);
    }
  },

  _didInitPlayer: function(player) {
    this._applyPropertiesToPlayer(player);
    this._setupPlayerEvents(player);

    this.set('player', player);

    this.one('willDestroyElement', function() {
      player.dispose();
    });
  },

  _initPlayer: Ember.on('didInsertElement', function() {
    var self = this;
    var element = $('video')[0];
    var options = {};

    this.set('_readyPromise', new Ember.RSVP.Promise(function(resolve) {
      videojs(element, options, function() { resolve(this); });
    }));

    this.ready().then(function(player) {
      self._didInitPlayer(player);
    });
  }),

  _registerPlayerObserver: function(property, target, observer) {
    var scheduledObserver = function() {
      Ember.run.scheduleOnce('render', this, observer);
    };

    this.addObserver(property, target, scheduledObserver);

    this.one('willClearRender', this, function() {
      this.removeObserver(property, target, scheduledObserver);
    });
  },

  _setupPlayerEventHandler: function(player, event, eventName) {
    var handlerFunction = Ember.run.bind(this, function(e) {
      this.trigger(eventName, player, e);
    });

    // Bind an event handler to the player. We don't need to worry about
    // tearing it down since video.js does that for us on dispose.
    player.on(event, handlerFunction);
  },

  _setupPlayerEvents: function(player) {
    var event;
    var events = this.get('playerEvents');

    for (event in events) {
      if (events.hasOwnProperty(event)) {
        this._setupPlayerEventHandler(player, event, events[event]);
      }
    }
  },

  _setupPlayerPropertyBindingObservation: function(player, property) {
    var observer = function() {
      var propertyValue = this.get(property);
      this._applyPlayerProperty(player, property, propertyValue);
    };

    this._registerPlayerObserver(property, this, observer);
  }
});
