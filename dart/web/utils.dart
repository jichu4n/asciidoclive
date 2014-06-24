/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Misc utils.
*/

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
      print('Found JavaScript property ${prop_string}');
      completer.complete(obj);
    } else {
      new Timer(PROPERTY_POLL_INTERVAL, completeIfJsAttrExists);
    }
  }
  new Timer(PROPERTY_POLL_INTERVAL, completeIfJsAttrExists);

  return completer.future;
}

// Sends a JSON POST request. Returns the request. On successful response, will
// parse the response into JSON and invoke the onLoad callback.
HttpRequest postJson(
    String url,
    Map args,
    void onLoad(Map responseJson),
    {void onError(HttpRequest request, ProgressEvent e),
     String method: 'POST'}) {
  HttpRequest httpRequest = new HttpRequest();
  httpRequest.open(method, url);
  httpRequest.setRequestHeader(
      'Content-Type', 'application/json; charset=UTF-8');
  httpRequest.onLoad.listen((ProgressEvent e) {
    // Note: file:// URIs have status of 0.
    if ((httpRequest.status >= 200 && httpRequest.status < 300) ||
        httpRequest.status == 0 || httpRequest.status == 304) {
      onLoad(JSON.decode(httpRequest.responseText));
    } else {
      if (onError == null) {
        print('HttpRequest error: ${e.toString()}');
      } else {
        onError(httpRequest, e);
      }
    }
  });
  httpRequest.send(JSON.encode(args));

  return httpRequest;
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
