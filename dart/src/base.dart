/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Base class for pages.
*/

import 'dart:convert';
import 'dart:html';
import 'user_manager.dart';
import 'utils.dart';

// Base class for client-side code on a page.
abstract class BasePage {
  BasePage() {
    // Set auth state change callback to refresh base page UI.
    new UserManager(() {
      postJson(_AUTH_STATE_CHANGE_REFRESH_UI, {}, _onAuthStateChangeRefresh);
      _signInWindowWrapperNode.classes.add('hidden');
    });
    // Event listeners.
    querySelector('#sign-in-button-launcher').onClick.listen((_) {
      _overlayNode.classes.remove('hidden');
      _signInWindowWrapperNode.classes.remove('hidden');
    });
    querySelector('#sign-in-window .ui-button-cancel').onClick.listen((_) {
      _signInWindowWrapperNode.classes.add('hidden');
      _overlayNode.classes.add('hidden');
    });
  }

  // Callback invoked when we receive changed UI elements following auth state
  // change.
  void _onAuthStateChangeRefresh(Map response) {
    if (response['success']) {
      print('Refreshing page elements following auth state change');
      // Refresh header.
      replaceWithHtml('#header', response['header']);
    } else {
      print('Failed to refresh on auth state change. Error: ' +
            response['error_message']);
    }
    _overlayNode.classes.add('hidden');
  }

  // Auth state change refresh API.
  final String _AUTH_STATE_CHANGE_REFRESH_UI =
      '/api/v1/auth_state_change_refresh';
  // DOM elements.
  final Element _overlayNode = querySelector('#overlay');
  final Element _signInWindowWrapperNode =
      querySelector('#sign-in-window-wrapper');
}
