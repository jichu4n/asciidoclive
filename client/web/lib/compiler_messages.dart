/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Compiler error messages and parser.
*/

library compiler_messages;

import 'package:logging/logging.dart';


// Model of a message emitted by a document compiler.
class CompilerMessage {
  // Message types.
  static final String WARNING = 'warning';
  static final String ERROR = 'error';

  // The message type.
  String type;
  // The message text.
  String text;
  // The line number (optional).
  int lineNumber = null;
}


// Parser for AsciiDoc compiler messages.
class AsciiDocMessageParser {
  // Parses AsciiDoc stderr output into a list of messages.
  List<CompilerMessage> parseMessages(bool success, String errorMessage) {
    List<CompilerMessage> messages = [];

    for (String line in errorMessage.split('\n')) {
      CompilerMessage message = new CompilerMessage();
      message.text = line.replaceAllMapped(
          _ERROR_MESSAGE_RE, (Match m) => m[1]);
      if (message.text.isEmpty) {
        continue;
      }
      message.type = success ? CompilerMessage.WARNING : CompilerMessage.ERROR;
      try {
        message.lineNumber = int.parse(
            message.text.replaceAllMapped(
                _ERROR_MESSAGE_LINE_NUMBER_RE, (Match m) => m[1]));
      } on FormatException catch (e) {
        _log.finest('Could not parse line number from message: ${e}');
      }
      // Capitalize first character in line.
      message.text = message.text.substring(0, 1).toUpperCase() +
          message.text.substring(1);

      messages.add(message);
    }

    return messages;
  }


  // Logger.
  final Logger _log = new Logger('AsciiDocMessageParser');

  // Regular expression for extracting message to be displayed from a raw error
  // message.
  static final RegExp _ERROR_MESSAGE_RE =
      new RegExp(r'^(?:[^:]+:\s+){3}(.*)$');
  // Regular expression for extracting the line number from an error message.
  static final RegExp _ERROR_MESSAGE_LINE_NUMBER_RE =
      new RegExp(r'^line\s+(\d+):.*$');
}
