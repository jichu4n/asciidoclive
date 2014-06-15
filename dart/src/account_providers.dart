/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Account providers.
*/

import 'dart:async';
import 'dart:convert';
import 'dart:js';
import 'utils.dart';

// Authentication information obtained from a provider.
class AuthData {
  // The provider's ID for this user.
  String userId;
  // The authentication token.
  String authToken;
  // Extra data obtained from the account provider.
  Map data;
}

// Callback invoked when authentication is complete.
typedef void OnAuthCallback(AccountProvider accountProvider);
// Interface for account providers (e.g., Google, Facebook).
abstract class AccountProvider {

  // Constructor. Will invoke onAuth ready if silently logged in.
  AccountProvider(String type, OnAuthCallback onAuth) {
    _type = type;
    _onAuth = onAuth;
  }

  // An identifier for this instance.
  String get type => _type;

  // Returns whether the user is already logged in.
  bool get hasAuth => _hasAuth;

  // Starts the sign-in process for the provider asynchronously. Will invoke the
  // onAuthResult callback when complete.
  void auth();

  // Returns account information from the provider.
  AuthData get authData => _authData;

  // An identifier for this instance.
  String _type;
  // Indicates whether we are already signed in.
  bool _hasAuth = false;
  // Retrieved account data.
  AuthData _authData = null;
  // Callback invoked when logged in.
  OnAuthCallback _onAuth;
}


// Google accounts.
class GoogleAccountProvider extends AccountProvider {

  // Constructor.
  GoogleAccountProvider(String type, OnAuthCallback onAuth)
      : super(type, onAuth) {
    whenJsPropExists('gapi.client.load').then(_googleInit);
  }

  // Initialize Google JavaScript API and check if already authenticated.
  void _googleInit(JsObject _) {
    _gapi = context['gapi'];
    // Load the Google+ client API asynchronously.
    _gapi['client'].callMethod(
        'load', ['plus', 'v1', () {
          print('Google+ client API loaded');
        }]);
    _gapi['client'].callMethod('setApiKey', [_GOOGLE_API_KEY]);
    // Try silent authentication.
    final Map<String, String> params = {
        'client_id': _GOOGLE_CLIENT_ID,
        'scope': _GOOGLE_AUTH_SCOPES.join(' '),
        'immediate': true,
    };
    _gapi['auth'].callMethod(
        'authorize', [new JsObject.jsify(params), _onGoogleAuthStateChange]);
  }

  @override
  void auth() {
    if (_hasAuth) {
      _onAuth(this);
    } else {
      final Map<String, String> params = {
          'client_id': _GOOGLE_CLIENT_ID,
          'scope': _GOOGLE_AUTH_SCOPES.join(' '),
          'immediate': false,
      };
      _gapi['auth'].callMethod(
          'authorize', [new JsObject.jsify(params), _onGoogleAuthStateChange]);
    }
  }

  // Callback invoked when the auth state changes.
  void _onGoogleAuthStateChange(JsObject response) {
    if (response.hasProperty('access_token')) {
      print('Signed in to Google!');
      // We now execute a GET to plus/v1/people/me to fetch the user ID.
      whenJsPropExists('gapi.client.plus.people.get').then((_) {
        JsObject request = _gapi['client']['plus']['people'].callMethod(
            'get', [new JsObject.jsify({'userId': 'me'})]);
        // WTF is the second callback arg??? It is not shown in any of the
        // JavaScript examples / docs.
        request.callMethod('execute', [(JsObject response_2, _) {
          print('Retrieved Google user info');
          _hasAuth = true;
          _authData = new AuthData();
          _authData.authToken = response['access_token'];
          _authData.userId = response_2['id'];
          _authData.data = toMap(response_2);

          if (_onAuth != null) {
            _onAuth(this);
          }
        }]);
      });
    } else {
      print('Not signed in to Google.');
      _hasAuth = false;
    }
  }

  static final String _GOOGLE_CLIENT_ID = (
      '701344041607-pq2g8uisl3uhhjj2u15lilsqbgr24tdc'
      '.apps.googleusercontent.com');
  static final String _GOOGLE_API_KEY = 'AIzaSyD5dYsaLDbNQx2KLGhdKsBs50RREx34OXs';
  static final List<String> _GOOGLE_AUTH_SCOPES = ['profile', 'email'];
  // Handle to gapi object.
  JsObject _gapi;
}


// Facebook accounts.
class FacebookAccountProvider extends AccountProvider {

  // Constructor.
  FacebookAccountProvider(String type, OnAuthCallback onAuth)
      : super(type, onAuth) {
    whenJsPropExists('FB.init').then(_fbInit);
  }

  // Invokes FB.init() and checks if already authenticated.
  void _fbInit(JsObject _) {
    _fb = context['FB'];
    final Map<String, String> params = {
        'appId': _FACEBOOK_APP_ID,
        'xfbml': true,
        'status': true,
        'cookie': true,
        'version': 'v2.0',
    };
    _fb.callMethod('init', [new JsObject.jsify(params)]);
    _fb.callMethod('getLoginStatus', [_onFbAuthStateChange]);
  }

  // Callback invoked when the auth state changes.
  void _onFbAuthStateChange(JsObject response) {
    if (response['status'] == 'connected') {
      print('Signed in to Facebook!');
      _hasAuth = true;
      _authData = new AuthData();
      _authData.userId = response['authResponse']['userID'];
      _authData.authToken = response['authResponse']['accessToken'];
      _fb.callMethod('api', ['/me', (JsObject response_2) {
        if (response_2['error'] == null ||
            response_2['error'].isEmpty) {
          _authData.data = toMap(response_2);
        } else {
          print('Failed to retrieve Facebook user info. Error: ' +
                response_2['error']);
        }

        if (_onAuth != null) {
          _onAuth(this);
        }
      }]);
    } else {
      print('Not signed in to Facebook.');
      _hasAuth = false;
    }
  }

  @override
  void auth() {
    if (_hasAuth) {
      _onAuth(this);
    } else {
      final Map<String, String> params = {
          'scope': _FACEBOOK_AUTH_SCOPE.join(','),
      };
      _fb.callMethod(
          'login', [_onFbAuthStateChange, new JsObject.jsify(params)]);
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
