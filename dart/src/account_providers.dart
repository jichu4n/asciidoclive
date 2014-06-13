/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Account providers.
*/

import 'dart:async';
import 'dart:convert';
import 'dart:js';
import 'package:google_oauth2_client/google_oauth2_browser.dart';
import "package:google_plus_v1_api/plus_v1_api_browser.dart" as googlePlusClient;

// Account information obtained from a provider.
class AccountData {
  // The provider's ID for this user.
  String userId;
  // The person's nickname or first name.
  String greetingName;

  // Additional provider-specific data.
  Map data;
}

// Converts a JsObject to a JSON string.
String toJson(JsObject obj) {
  return context['JSON'].callMethod('stringify', [obj]);
}

// Converts a JsObject to a Map.
Map toMap(JsObject obj) {
  return JSON.decode(toJson(obj));
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
      _accountData = new AccountData();
      _accountData.userId = person.id;
      if (person.nickname != null && person.nickname.isNotEmpty) {
        _accountData.greetingName = person.nickname;
      } else {
        _accountData.greetingName = person.name.givenName;
      }
      _accountData.data = person.toJson();
      if (_onSignInReady != null) {
        _onSignInReady(this);
      }
    });

  }

  static final String _GOOGLE_CLIENT_ID = (
      '701344041607-pq2g8uisl3uhhjj2u15lilsqbgr24tdc'
      '.apps.googleusercontent.com');
  static final String _GOOGLE_API_KEY = 'AIzaSyD5dYsaLDbNQx2KLGhdKsBs50RREx34OXs';
  static final List<String> _GOOGLE_AUTH_SCOPES = ['profile', 'email'];
  GoogleOAuth2 _googleOAuth2;
}


// Facebook accounts.
class FacebookAccountProvider extends AccountProvider {

  // Constructor.
  FacebookAccountProvider(String type, OnSignInReadyCallback onSignInReady)
      : super(type, onSignInReady) {
    _fbInit();
  }

  // Invokes FB.init(). If the Facebook JavaScript SDK is not yet ready, will
  // set a timer to retry in a bit.
  void _fbInit() {
    if (context['isFbJsSdkLoaded']) {
      _fb = context['FB'];
      final Map<String, String> params = {
        'appId': _FACEBOOK_APP_ID,
        'xfbml': true,
        'status': true,
        'cookie': true,
        'version': 'v2.0',
      };
      _fb.callMethod('init', [new JsObject.jsify(params)]);
      _fb.callMethod('getLoginStatus', [_onFbSignInStateChange]);
    } else {
      print('Facebook JavaScript SDK not yet loaded, will retry.');
      new Timer(_FB_JS_SDK_POLL_INTERVAL, _fbInit);
    }
  }

  // Callback invoked when the sign-in state changes.
  void _onFbSignInStateChange(JsObject response) {
    if (response['status'] == 'connected') {
      print('Signed in to Facebook!');
      _isSignedIn = true;
      _fb.callMethod('api', ['/me', (JsObject response) {
        if (response.hasProperty('error')) {
          print('Error fetching user info!');
          print(toJson(response));
        } else {
          _accountData = new AccountData();
          _accountData.userId = response['id'];
          _accountData.greetingName = response['first_name'];
          _accountData.data = toMap(response);
        }
        if (_onSignInReady != null) {
          _onSignInReady(this);
        }
      }]);
    } else {
      print('Not signed in to Facebook.');
      _isSignedIn = false;
    }
  }

  @override
  void signIn() {
    if (_isSignedIn) {
      _onSignInReady(this);
    } else {
      final Map<String, String> params = {
          'scope': _FACEBOOK_AUTH_SCOPE.join(','),
      };
      _fb.callMethod(
          'login', [_onFbSignInStateChange, new JsObject.jsify(params)]);
    }
  }

  static final String _FACEBOOK_APP_ID = '644477638972528';
  static final List<String> _FACEBOOK_AUTH_SCOPE = ['public_profile', 'email'];
  // How long to wait before re-checking if the Facebook JavaScript SDK is
  // loaded.
  static const Duration _FB_JS_SDK_POLL_INTERVAL =
      const Duration(milliseconds: 100);
  // Handle to JavaScript FB object.
  JsObject _fb = null;
}
