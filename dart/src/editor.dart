/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Editor page.
*/

import 'base.dart';
import 'asciidoc_editor.dart';


// Implements the editor page.
class EditorPage extends BasePage {
  EditorPage() {
    new AsciiDocEditor();
  }
}

void main() {
  new EditorPage();
}
