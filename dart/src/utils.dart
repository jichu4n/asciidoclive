/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Misc utils.
*/

import 'dart:async';
import 'dart:js';

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
