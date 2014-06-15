/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Manages user accounts.
*/

import 'dart:html';
import 'dart:js';
import 'account_providers.dart';
import 'utils.dart';

// Class that manages user accounts and related workflows.
class UserManager {

  // Constructor. Takes a callback for auth state change.
  UserManager(void onAuthStateChangeCallback()) {
    _accountProviders = {
        'google': new GoogleAccountProvider('google', _onAuth),
        'facebook': new FacebookAccountProvider('facebook', _onAuth),
    };

    _onAuthStateChangeCallback = onAuthStateChangeCallback;

    // Register event handlers for sign-in buttons.
    querySelectorAll('.sign-in-button').forEach((Element e) {
      final String accountProviderType =
          e.attributes['data-account-provider-type'];
      assert(accountProviderType != null);
      assert(_accountProviders.containsKey(accountProviderType));
      // e.onClick.listen((_) => authHandlers[accountProviderType]());
      e.onClick.listen((_) {
        _accountProviders[accountProviderType].auth();
      });
    });
  }

  // Logs out the current user.
  void logout() {
    if (_userId == null) {
      return;
    }
    print('Logging out');
    postJson(_LOGOUT_URI, {}, _onLogoutResult);
  }

  // Invoked on a successful login. Sends login information to the server.
  void _onAuth(AccountProvider accountProvider) {
    print('Signed in to ${accountProvider.type}! Sending auth request');
    List<Map<String, String>> accounts = [];
    for (AccountProvider accountProvider in _accountProviders.values) {
      if (accountProvider.hasAuth) {
        accounts.add({
            'account_provider_type': accountProvider.type,
            'user_id': accountProvider.authData.userId,
            'auth_token': accountProvider.authData.authToken,
        });
      }
    }
    assert(accounts.isNotEmpty);
    postJson(_AUTH_URI, {'accounts': accounts}, _onAuthResult);
  }

  // Callback for a authentication API request.
  void _onAuthResult(Map response) {
    if (response['success']) {
      _userId = response['user_id'];
      print('Authenticated user ID ${_userId}');
    } else {
      _userId = null;
      print('Authentication failed! Error: ' + response['error_message']);
    }
    _onAuthStateChangeCallback();
  }

  // Callback for a logout API request.
  void _onLogoutResult(Map response) {
    if (response['success']) {
      print('Logged out user ID ${_userId}');
      _userId = null;
    } else {
      print('Log out failed! Error: ' + response['error_message']);
    }
    _onAuthStateChangeCallback();
  }

  // Auth API.
  static final String _AUTH_URI = '/api/v1/auth';
  static final String _LOGOUT_URI = '/api/v1/logout';
  // Maps auth type strings to account providers.
  Map<String, AccountProvider> _accountProviders;
  // Callback for auth state change.
  Function _onAuthStateChangeCallback;
  // The current logged in user ID.
  String _userId;
}
