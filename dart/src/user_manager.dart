/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Manages user accounts.
*/

import 'dart:html';
import 'dart:js';
import 'package:google_oauth2_client/google_oauth2_browser.dart';
import "package:google_plus_v1_api/plus_v1_api_browser.dart" as googlePlusClient;

// Class that manages user accounts and related workflows.
class UserManager {

  // Constructor.
  UserManager() {
    // Maps sign-in type strings to handlers.
    final Map<String, Function> signInHandlers = {
        'google': _handleGoogleSignIn,
        'facebook': _handleFacebookSignIn,
        'twitter': _handleTwitterSignIn,
        'linkedin': _handleLinkedInSignIn,
    };

    // Register event handlers for sign-in buttons.
    querySelectorAll('#sign-in-window .sign-in-button').forEach((Element e) {
      final String signInType = e.attributes['data-sign-in-type'];
      assert(signInType != null);
      assert(signInHandlers.containsKey(signInType));
      e.onClick.listen((_) => signInHandlers[signInType]());
    });
    _googleOAuth2 = new GoogleOAuth2(
        _GOOGLE_CLIENT_ID,
        _GOOGLE_AUTH_SCOPES,
        tokenLoaded:_onGoogleSignIn);
  }

  // Handler signing in via Google+.
  void _handleGoogleSignIn() {
    print('Handle Google sign-in');
    _googleOAuth2.login();
  }
  void _onGoogleSignIn(Token token) {
    print('Got token: ${token}');
    googlePlusClient.Plus plus = new googlePlusClient.Plus(_googleOAuth2);
    plus.key = _GOOGLE_API_KEY;
    plus.oauth_token = token.data;
    plus.people.get('me').then((person) {
      print('Name: ${person.displayName}');
      print('Email: ${person.emails[0].value}');
    });
  }

  // Handler signing in via Facebook.
  void _handleFacebookSignIn() {
    print('Facebook sign-in is not implemented yet.');
  }
  // Handler signing in via Twitter.
  void _handleTwitterSignIn() {
    print('Twitter sign-in is not implemented yet.');
  }
  // Handler signing in via LinkedIn.
  void _handleLinkedInSignIn() {
    print('LinkedIn sign-in is not implemented yet.');
  }

  static final String _GOOGLE_CLIENT_ID = '701344041607-pq2g8uisl3uhhjj2u15lilsqbgr24tdc.apps.googleusercontent.com';
  static final String _GOOGLE_API_KEY = 'AIzaSyD5dYsaLDbNQx2KLGhdKsBs50RREx34OXs';
  static final List<String> _GOOGLE_AUTH_SCOPES = ['profile', 'email'];
  GoogleOAuth2 _googleOAuth2;
}
