/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Misc utils.
*/

library utils;

import 'dart:async';
import 'dart:convert';
import 'dart:html';
import 'dart:js';
import 'package:logging/logging.dart';

// Converts a JsObject to a JSON string.
String toJson(JsObject obj) {
  return context['JSON'].callMethod('stringify', [obj]);
}

// Converts a JsObject to a Map.
Map toMap(JsObject obj) {
  return JSON.decode(toJson(obj));
}

// Returns a future that waits until a particular property appears in
// JavaScript. The argument should be of the form 'foo.bar.baz', where 'foo'
// should be a property of the window object.
//
// The future returns the JsObject corresponding to the property.
Future<JsObject> whenJsPropExists(String prop_string) {
  final Logger _log = new Logger('whenJsPropExists');
  const Duration PROPERTY_POLL_INTERVAL = const Duration(milliseconds: 25);
  final List<String> props = prop_string.split('.');

  Completer completer = new Completer();

  // A closure that checks if the property exists periodically. If it does,
  // it completes the future; otherwise, it schedules itself.
  void completeIfJsAttrExists() {
    bool props_exist = true;
    JsObject obj = context;
    for (String prop in props) {
      if (obj.hasProperty(prop)) {
        obj = obj[prop];
      } else {
        props_exist = false;
        break;
      }
    }

    if (props_exist) {
      _log.finest('Found JavaScript property ${prop_string}');
      completer.complete(obj);
    } else {
      new Timer(PROPERTY_POLL_INTERVAL, completeIfJsAttrExists);
    }
  }
  new Timer(PROPERTY_POLL_INTERVAL, completeIfJsAttrExists);

  return completer.future;
}

// Default number of milliseconds before timing out an API call.
const int _DEFAULT_REQUEST_TIMEOUT_MS = 15 * 1000;

// Sends a JSON request to an API endpoint on our server. Returns a Future<Map>
// that will yield the response as JSON. If [request] is specified, will use
// [request] instead of creating a new one.
Future<Map> callApi(
    String url,
    Map args,
    {String method: 'POST',
     int timeoutMs: _DEFAULT_REQUEST_TIMEOUT_MS,
     HttpRequest request}) {
  final Logger _log = new Logger('callApi');
  Completer completer;

  HttpRequest httpRequest = request == null ? new HttpRequest() : request;
  httpRequest.open(method, url);
  httpRequest.setRequestHeader(
      'Content-Type', 'application/json; charset=UTF-8');
  httpRequest.timeout = timeoutMs;
  httpRequest.onLoad.listen((_) {
    // Note: file:// URIs have status of 0.
    if ((httpRequest.status >= 200 && httpRequest.status < 300) ||
        httpRequest.status == 0 || httpRequest.status == 304) {
      final Map response = JSON.decode(httpRequest.responseText);
      if (response != null && response['success']) {
        completer.complete(response);
      } else {
        _log.severe(
            'API call failed! ' + (
                response == null ? '' : 'Error: ' + response['error_message']));
        completer.completeError(response);
      }
    } else {
      _log.severe(
          'API request failed! '
          'Status: ${httpRequest.status}, response: ${httpRequest.responseText}');
      completer.completeError({
        'success': false,
        'error_message': request.responseText,
      });
    }
  });
  httpRequest.onTimeout.listen((_) {
    _log.severe('API call timed out!');
    completer.completeError({
      'success': false,
      'error_message': 'Time out',
    });
  });
  httpRequest.onError.listen((e) {
    _log.severe('API request failed! Error: ${e.toString()}');
    completer.completeError({
      'success': false,
      'error_message': e.toString(),
    });
  });
  httpRequest.send(JSON.encode(args));

  return completer.future;
}

// A custom NodeValidatorBuilder based on NodeValidator.common() that accepts
// attributes beginning with "data-".
class DefaultNodeValidator extends NodeValidatorBuilder {

  // Constructor.
  DefaultNodeValidator()
      : super.common() {
  }

  @override
  bool allowsAttribute(Element element, String attributeName, String value) {
    return super.allowsAttribute(element, attributeName, value) ||
        attributeName.startsWith('data-');
  }
}

// Parses an HTML fragment, finds the element matching the given selector and
// uses it to replace the element in the document that matches the same
// selector.
void replaceWithHtml(String selector, String htmlString) {
  DocumentFragment fragment = new DocumentFragment.html(
      htmlString, validator: new DefaultNodeValidator());
  querySelector(selector).replaceWith(fragment.querySelector(selector));
}

// Initializes logging.
void setUpLogging() {
  Logger.root.level = Level.ALL;
  Logger.root.onRecord.listen((LogRecord rec) {
    print('${rec.level.name}: ${rec.message}');
  });
}
