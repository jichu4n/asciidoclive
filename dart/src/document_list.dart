/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Document list page.
*/

import 'dart:html';
import 'base.dart';


// Implements the document list page.
class DocumentListPage extends BasePage {
  DocumentListPage() {
  }


  @override
  void onAuthStateChange() {
    if (!userManager.isSignedIn) {
      window.location.assign(ROOT_URI);
    } else {
      super.onAuthStateChange();
    }
  }
}

void main() {
  new DocumentListPage();
}
