/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Manages user accounts.
*/

import 'dart:convert';
import 'dart:html';
import 'dart:js';
import 'account_providers.dart';
import 'utils.dart';

// Class that manages user accounts and related workflows.
class UserManager {

  // Constructor.
  UserManager() {
    _accountProviders = {
        'google': new GoogleAccountProvider('google', _onAuth),
        'facebook': new FacebookAccountProvider('facebook', _onAuth),
    };

    // Register event handlers for sign-in buttons.
    querySelectorAll('#sign-in-window .sign-in-button').forEach((Element e) {
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
  void _onAuthResult(HttpRequest request) {
    print('Got auth response: ${request.responseText}');
    Map response = JSON.decode(request.responseText);
  }

  // Auth API.
  static final String _AUTH_URI = '/api/v1/auth';
  // Maps auth type strings to account providers.
  Map<String, AccountProvider> _accountProviders;
}
