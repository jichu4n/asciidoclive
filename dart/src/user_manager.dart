/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Manages user accounts.
*/

import 'dart:html';
import 'dart:js';
import 'account_providers.dart';

// Class that manages user accounts and related workflows.
class UserManager {

  // Constructor.
  UserManager() {
    // Maps auth type strings to account providers.
    final Map<String, AccountProvider> accountProviders = {
        'google': new GoogleAccountProvider('google', _onAuth),
        'facebook': new FacebookAccountProvider('facebook', _onAuth),
        'twitter': null,
        'linkedin': null,
    };

    // Register event handlers for sign-in buttons.
    querySelectorAll('#sign-in-window .sign-in-button').forEach((Element e) {
      final String accountProviderType =
          e.attributes['data-account-provider-type'];
      assert(accountProviderType != null);
      assert(accountProviders.containsKey(accountProviderType));
      // e.onClick.listen((_) => authHandlers[accountProviderType]());
      e.onClick.listen((_) {
        final AccountProvider provider = accountProviders[accountProviderType];
        if (provider == null) {
          print('Not implemented :(');
        } else {
          provider.auth();
        }
      });
    });

  }

  // Invoked on a successful login.
  void _onAuth(AccountProvider accountProvider) {
    print('Signed in abstraaaactly to ${accountProvider.type}!');
    print('User ID: ${accountProvider.authData.userId}');
    print('Auth token: ${accountProvider.authData.authToken}');
  }
}
