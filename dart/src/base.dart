/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Base class for pages.
*/

import 'dart:convert';
import 'user_manager.dart';
import 'utils.dart';

// Base class for client-side code on a page.
abstract class BasePage {
  BasePage() {
    new UserManager(() =>
        postJson(_AUTH_STATE_CHANGE_REFRESH_UI, {}, _onAuthStateChangeRefresh));
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
  }

  final String _AUTH_STATE_CHANGE_REFRESH_UI =
      '/api/v1/auth_state_change_refresh';
}
