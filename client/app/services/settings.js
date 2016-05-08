/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import Ember from 'ember';
import { localStorageProxy } from 'ember-local-storage-proxy';

export default Ember.Service.extend({
  syncScroll: Ember.computed(localStorageProxy('v1/syncScroll', false)),
  editorThemeName: Ember.computed(localStorageProxy(
    'v1/editorThemeName', 'Default')),
  highlightjsThemeName: Ember.computed(localStorageProxy(
    'v1/highlightjsThemeName', 'Default')),
  editorFont: Ember.computed(localStorageProxy('v1/editorFont', '')),
  editorFontSize: Ember.computed(localStorageProxy('v1/editorFontSize', 14)),
  previewFont: Ember.computed(localStorageProxy('v1/previewFont', '')),
  previewFontSize: Ember.computed(localStorageProxy('v1/previewFontSize', 14)),
  editorModeName: Ember.computed(localStorageProxy(
    'v1/editorModeName', 'Default')),
  recentFiles: Ember.computed(localStorageProxy('v1/recentFiles', [])),
  autoSave: Ember.computed(localStorageProxy('v1/autoSave', false)),

  EDITOR_THEMES: [
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
  editorTheme: Ember.computed('editorThemeName', function() {
    return this.get('EDITOR_THEMES')
      .findBy('name', this.get('editorThemeName')).value;
  }),

  HIGHLIGHTJS_THEMES: [
    { name: 'Default', value: 'default' },
    { name: 'Agate', value: 'agate' },
    { name: 'Android Studio', value: 'androidstudio' },
    { name: 'Arduino Light', value: 'arduino-light' },
    { name: 'Arta', value: 'arta' },
    { name: 'Ascetic', value: 'ascetic' },
    { name: 'Atelier Cave Dark', value: 'atelier-cave-dark' },
    { name: 'Atelier Cave Light', value: 'atelier-cave-light' },
    { name: 'Atelier Dune Dark', value: 'atelier-dune-dark' },
    { name: 'Atelier Dune Light', value: 'atelier-dune-light' },
    { name: 'Atelier Estuary Dark', value: 'atelier-estuary-dark' },
    { name: 'Atelier Estuary Light', value: 'atelier-estuary-light' },
    { name: 'Atelier Forest Dark', value: 'atelier-forest-dark' },
    { name: 'Atelier Forest Light', value: 'atelier-forest-light' },
    { name: 'Atelier Heath Dark', value: 'atelier-heath-dark' },
    { name: 'Atelier Heath Light', value: 'atelier-heath-light' },
    { name: 'Atelier Lakeside Dark', value: 'atelier-lakeside-dark' },
    { name: 'Atelier Lakeside Light', value: 'atelier-lakeside-light' },
    { name: 'Atelier Plateau Dark', value: 'atelier-plateau-dark' },
    { name: 'Atelier Plateau Light', value: 'atelier-plateau-light' },
    { name: 'Atelier Savanna Dark', value: 'atelier-savanna-dark' },
    { name: 'Atelier Savanna Light', value: 'atelier-savanna-light' },
    { name: 'Atelier Seaside Dark', value: 'atelier-seaside-dark' },
    { name: 'Atelier Seaside Light', value: 'atelier-seaside-light' },
    { name: 'Atelier Sulphurpool Dark', value: 'atelier-sulphurpool-dark' },
    { name: 'Atelier Sulphurpool Light', value: 'atelier-sulphurpool-light' },
    { name: 'Brown Paper', value: 'brown-paper' },
    { name: 'Codepen Embed', value: 'codepen-embed' },
    { name: 'Color Brewer', value: 'color-brewer' },
    { name: 'Dark', value: 'dark' },
    { name: 'Darkula', value: 'darkula' },
    { name: 'Docco', value: 'docco' },
    { name: 'Dracula', value: 'dracula' },
    { name: 'Far', value: 'far' },
    { name: 'Foundation', value: 'foundation' },
    { name: 'Github', value: 'github' },
    { name: 'Github Gist', value: 'github-gist' },
    { name: 'Googlecode', value: 'googlecode' },
    { name: 'Grayscale', value: 'grayscale' },
    { name: 'Gruvbox Dark', value: 'gruvbox-dark' },
    { name: 'Gruvbox Light', value: 'gruvbox-light' },
    { name: 'Hopscotch', value: 'hopscotch' },
    { name: 'Hybrid', value: 'hybrid' },
    { name: 'IDEA', value: 'idea' },
    { name: 'IR Black', value: 'ir-black' },
    { name: 'Magula', value: 'magula' },
    { name: 'Mono Blue', value: 'mono-blue' },
    { name: 'Monokai', value: 'monokai' },
    { name: 'Monokai Sublime', value: 'monokai-sublime' },
    { name: 'Obsidian', value: 'obsidian' },
    { name: 'Paraiso Dark', value: 'paraiso-dark' },
    { name: 'Paraiso Light', value: 'paraiso-light' },
    { name: 'Pojoaque', value: 'pojoaque' },
    { name: 'RailsCasts', value: 'railscasts' },
    { name: 'Rainbow', value: 'rainbow' },
    { name: 'School Book', value: 'school-book' },
    { name: 'Solarized Dark', value: 'solarized-dark' },
    { name: 'Solarized Light', value: 'solarized-light' },
    { name: 'Sunburst', value: 'sunburst' },
    { name: 'Tomorrow', value: 'tomorrow' },
    { name: 'Tomorrow Night Blue', value: 'tomorrow-night-blue' },
    { name: 'Tomorrow Night Bright', value: 'tomorrow-night-bright' },
    { name: 'Tomorrow Night', value: 'tomorrow-night' },
    { name: 'Tomorrow Night Eighties', value: 'tomorrow-night-eighties' },
    { name: 'VS', value: 'vs' },
    { name: 'Xcode', value: 'xcode' },
    { name: 'Zenburn', value: 'zenburn' },
  ],
  highlightjsTheme: Ember.computed('highlightjsThemeName', function() {
    return this.get('HIGHLIGHTJS_THEMES')
      .findBy('name', this.get('highlightjsThemeName')).value;
  }),

  EDITOR_MODES: [
    { name: 'Default', value: '' },
    { name: 'Vim', value: 'ace/keyboard/vim' },
    { name: 'Emacs', value: 'ace/keyboard/emacs' }
  ],
  editorMode: Ember.computed('editorModeName', function() {
    return this.get('EDITOR_MODES')
      .findBy('name', this.get('editorModeName')).value;
  }),

  minFontSize: 8,
  maxFontSize: 24,
  previewFontSizeBase: 14,

  maxRecentFiles: 5
});
