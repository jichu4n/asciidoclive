/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Account providers.
*/

import 'dart:async';
import 'package:google_oauth2_client/google_oauth2_browser.dart';
import "package:google_plus_v1_api/plus_v1_api_browser.dart" as googlePlusClient;

// Account information obtained from a provider.
class AccountData {
  // Main e-mail address. Additional addresses should be in custom data.
  String email;

  // Additional provider-specific data.
  Map data;
}

// Callback invoked when sign-in is complete.
typedef void OnSignInReadyCallback(AccountProvider accountProvider);
// Interface for account providers (e.g., Google, Facebook).
abstract class AccountProvider {

  // Constructor. Will invoke onSignIn ready if silently logged in.
  AccountProvider(String type, OnSignInReadyCallback onSignInReady) {
    _type = type;
    _onSignInReady = onSignInReady;
  }

  // An identifier for this instance.
  String get type => _type;

  // Returns whether the user is already logged in.
  bool get isSignedIn => _isSignedIn;

  // Starts the sign-in process for the provider asynchronously. Will invoke the
  // onSignInResult callback when complete.
  void signIn();

  // Returns account information from the provider.
  AccountData get accountData => _accountData;

  // An identifier for this instance.
  String _type;
  // Indicates whether we are already signed in.
  bool _isSignedIn = false;
  // Retrieved account data.
  AccountData _accountData = null;
  // Callback invoked when logged in.
  OnSignInReadyCallback _onSignInReady;
}


// Google accounts.
class GoogleAccountProvider extends AccountProvider {

  // Constructor.
  GoogleAccountProvider(String type, OnSignInReadyCallback onSignInReady)
      : super(type, onSignInReady) {
    // Initialize OAuth2 client. This will trigger the sign-in callback if
    // silently sign-in.
    _googleOAuth2 = new GoogleOAuth2(
        _GOOGLE_CLIENT_ID,
        _GOOGLE_AUTH_SCOPES,
        tokenLoaded:_onGoogleSignIn,
        autoLogin: true);
  }

  @override
  void signIn() {
    if (_isSignedIn) {
      _onSignInReady(this);
    } else {
      _googleOAuth2.login();
    }
  }

  // Callback for successful login to Google.
  void _onGoogleSignIn(Token token) {
    print('Signed in to Google with token: ${token.toString()}');
    _isSignedIn = true;

    googlePlusClient.Plus plus = new googlePlusClient.Plus(_googleOAuth2);
    plus.key = _GOOGLE_API_KEY;
    plus.oauth_token = token.data;
    plus.people.get('me').then((person) {
      assert(person.emails.isNotEmpty);
      _accountData = new AccountData();
      _accountData.email = person.emails[0].value;
      _accountData.data = person.toJson();
    });

    if (_onSignInReady != null) {
      _onSignInReady(this);
    }
  }

  static final String _GOOGLE_CLIENT_ID = (
      '701344041607-pq2g8uisl3uhhjj2u15lilsqbgr24tdc'
      '.apps.googleusercontent.com');
  static final String _GOOGLE_API_KEY = 'AIzaSyD5dYsaLDbNQx2KLGhdKsBs50RREx34OXs';
  static final List<String> _GOOGLE_AUTH_SCOPES = ['profile', 'email'];
  GoogleOAuth2 _googleOAuth2;
}
