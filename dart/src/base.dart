/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Base class for pages.
*/

import 'user_manager.dart';

// Base class for client-side code on a page.
abstract class BasePage {
  BasePage() {
    new UserManager();
  }
}
