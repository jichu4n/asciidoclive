/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import { localStorageProxy } from 'ember-local-storage-proxy';

export default Ember.Service.extend({
  syncScroll: Ember.computed(localStorageProxy('v1/syncScroll', false)),
  themeName: Ember.computed(localStorageProxy('v1/themeName', 'Default')),
  THEMES: [
    { name: 'Default', value: undefined },
    { name: 'Ambiance', value: 'ambiance' },
    { name: 'Chaos', value: 'chaos' },
    { name: 'Chrome', value: 'chrome' },
    { name: 'Clouds', value: 'clouds' },
    { name: 'Clouds Midnight', value: 'clouds_midnight' },
    { name: 'Cobalt', value: 'cobalt' },
    { name: 'Crimson Editor', value: 'crimson_editor' },
    { name: 'Dawn', value: 'dawn' },
    { name: 'Dreamweaver', value: 'dreamweaver' },
    { name: 'Eclipse', value: 'eclipse' },
    { name: 'GitHub', value: 'github' },
    { name: 'Idle Fingers', value: 'idle_fingers' },
    { name: 'Iplastic', value: 'iplastic' },
    { name: 'Katzenmilch', value: 'katzenmilch' },
    { name: 'KR Theme', value: 'kr_theme' },
    { name: 'Kuroir', value: 'kuroir' },
    { name: 'Merbivore', value: 'merbivore' },
    { name: 'Merbivore Soft', value: 'merbivore_soft' },
    { name: 'Mono Industrial', value: 'mono_industrial' },
    { name: 'Monokai', value: 'monokai' },
    { name: 'Pastel on Dark', value: 'pastel_on_dark' },
    { name: 'Solarized Dark', value: 'solarized_dark' },
    { name: 'Solarized Light', value: 'solarized_light' },
    { name: 'SQLServer', value: 'sqlserver' },
    { name: 'Terminal', value: 'terminal' },
    { name: 'Textmate', value: 'textmate' },
    { name: 'Tomorrow', value: 'tomorrow' },
    { name: 'Tomorrow Night', value: 'tomorrow_night' },
    { name: 'Tomorrow Night Blue', value: 'tomorrow_night_blue' },
    { name: 'Tomorrow Night Bright', value: 'tomorrow_night_bright' },
    { name: 'Tomorrow Night Eighties', value: 'tomorrow_night_eighties' },
    { name: 'Twilight', value: 'twilight' },
    { name: 'Vibrant Ink', value: 'vibrant_ink' },
    { name: 'Xcode', value: 'xcode' }
  ],
  theme: Ember.computed('themeName', function() {
    return this.get('THEME')[this.get('themeName')];
  })
});
