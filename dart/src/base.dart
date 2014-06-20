/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Base class for pages.
*/

import 'dart:async';
import 'dart:convert';
import 'dart:html';
import 'dart:js';
import 'user_manager.dart';
import 'utils.dart';

// An item in a menu.
class MenuItem {
  // The icon of the item, as a FontAwesome class name.
  String icon;
  // The text to display.
  String title;
  // The callback to invoke when the menu is clicked. Will be invoked with no
  // arguments.
  Function callback;

  MenuItem(this.icon, this.title, this.callback);
}

// A menu.
class Menu {
  // An identifier.
  String id;
  // The items.
  List<MenuItem> items;
}

// Base class for client-side code on a page.
abstract class BasePage {
  BasePage() {
    // Set auth state change callback to refresh base page UI.
    _userManager = new UserManager(
      _baseParams['user_id'],
      querySelector('#${SIGN_IN_DIALOG}-dialog'),
      _onAccountProviderSignIn,
      onAuthStateChange);
    registerHeaderEventListeners();
    _setUpAccountMenu();

    querySelector('#sign-in-dialog .ui-button-cancel').onClick.listen((_) =>
        hideDialog());
  }

  // Inflates a menu and binds it to the corresponding menu button element.
  void addHeaderMenu(Menu menu) {
    Element menuNode = _inflateMenu(menu);
    menuNode.classes.add('hidden');
    menuNode.onMouseOver.listen(
        (_) => _onMenuMouseOver(_getMenuButtonById(menu.id), menuNode));
    menuNode.onMouseOut.listen(
        (_) => _onMenuMouseOut(_getMenuButtonById(menu.id), menuNode));
    _menus[menu.id] = menuNode;
    document.body.children.add(menuNode);

    _registerMenuButtonEventHandlers(menu.id);
  }

  // Returns the user manager instance.
  UserManager get userManager => _userManager;

  // The dialog ID of the sign-in dialog.
  final String SIGN_IN_DIALOG = 'sign-in';
  // The dialog ID of the sign-in pending dialog.
  final String SIGN_IN_PENDING_DIALOG = 'sign-in-pending';

  // Shows a dialog. If another dialog is already being shown, hides it first.
  void showDialog(String dialogId) {
    if (_activeDialogWrapperNode != null) {
      _activeDialogWrapperNode.classes.add('hidden');
    }
    _overlayNode.classes.remove('hidden');
    _activeDialogWrapperNode = querySelector('#${dialogId}-dialog-wrapper');
    if (_activeDialogWrapperNode == null) {
      print('Warning: no dialog with ID ${dialogId} found');
      return;
    }
    _activeDialogWrapperNode.classes.remove('hidden');
  }
  static const Duration DEFAULT_DIALOG_TIMEOUT =
      const Duration(milliseconds: 1500);
  void showDialogWithTimeout(
      String dialogId, {Duration timeout: DEFAULT_DIALOG_TIMEOUT}) {
    showDialog(dialogId);
    new Timer(timeout, hideDialog);
  }

  // Hides the currently active dialog.
  void hideDialog() {
    if (_activeDialogWrapperNode == null) {
      print('Warning: no currently active dialog');
      return;
    }
    _activeDialogWrapperNode.classes.add('hidden');
    _overlayNode.classes.add('hidden');
    _activeDialogWrapperNode = null;
  }

  // Attaches event handlers on a header refresh. This should be overridden if
  // the child page adds additional header elements.
  void registerHeaderEventListeners() {
    querySelector('#sign-in-button').onClick.listen((_) =>
        showDialog(SIGN_IN_DIALOG));
  }

  // Callback invoked when the user is authenticated with our own server or is
  // logged out.
  void onAuthStateChange() {
    HttpRequest.getString('${window.location.href}?header=1')
        .then(_onNewHeader);
  }

  // The URI for the site root.
  final String ROOT_URI = '/';

  // Callback invoked when the user completes sign-in with an account provider,
  // but we have not yet received validation from our own server.
  void _onAccountProviderSignIn() {
    showDialog(SIGN_IN_PENDING_DIALOG);
  }

  // Callback invoked when we receive changed UI header following auth state
  // change.
  void _onNewHeader(String headerHtml) {
    print('Refreshing page elements following auth state change');
    if (_userManager.isSignedIn) {
      showDialogWithTimeout(_SIGN_IN_SUCCESS_DIALOG);
    } else {
      showDialogWithTimeout(_SIGN_OUT_SUCCESS_DIALOG);
    }
    // Refresh header and re-register event handlers, as the old elements have
    // been deleted along with any event handlers.
    replaceWithHtml('#header', headerHtml);
    registerHeaderEventListeners();
    // Re-register menu buttons.
    for (String menuId in _menus.keys) {
      _registerMenuButtonEventHandlers(menuId);
    }
  }

  // Returns the menu button corresponding to a menu ID. If not found, returns
  // None.
  Element _getMenuButtonById(String menuId) {
    return querySelector('.menu-button[data-menu-id="${menuId}"]');
  }

  // Creates the account menu.
  void _setUpAccountMenu() {
    Menu accountMenu = new Menu();
    accountMenu.id = 'account-menu';
    accountMenu.items = [
        new MenuItem(
            'fa-sign-out', 'Log out', () => _userManager.logout()),
    ];
    addHeaderMenu(accountMenu);
  }

  // Inflates a menu.
  Element _inflateMenu(Menu menu) {
    Element menuNode = new Element.div();
    menuNode.attributes['data-menu-id'] = menu.id;
    menuNode.classes.add('menu');

    for (MenuItem item in menu.items) {
      Element itemNode = new Element.div();
      itemNode.onClick.listen((_) {
        menuNode.classes.add('hidden');
        item.callback();
      });
      itemNode.classes.add('item');

      Element iconNode = new Element.span();
      iconNode.classes.addAll(['icon', 'fa', item.icon]);
      itemNode.children.add(iconNode);

      itemNode.appendText('  ${item.title}');

      menuNode.children.add(itemNode);
    }

    return menuNode;
  }

  void _onMenuButtonMouseOver(Element menuButtonNode, Element menuNode) {
    final Element headerNode = querySelector('#header');
    if (menuNode.classes.contains('hidden')) {
      // First time we are activating this menu.
      menuNode.classes.remove('hidden');
      if (menuButtonNode.documentOffset.x + menuNode.clientWidth <=
          window.innerWidth) {
        menuNode.style.left = '${menuButtonNode.documentOffset.x}px';
      } else {
        menuNode.style.left = '${window.innerWidth - menuNode.clientWidth}px';
      }
      menuNode.style.top = '${headerNode.clientHeight}px';
    } else {
      // We just moved the cursor back to the button after moving over the menu.
      assert(_menuTimers[menuNode] != null);
      _menuTimers[menuNode].cancel();
    }
  }
  void _onMenuButtonMouseOut(Element menuButtonNode, Element menuNode) {
    _menuTimers[menuNode] = new Timer(_MENU_HIDE_DELAY, () =>
        menuNode.classes.add('hidden'));
  }
  void _onMenuMouseOver(Element menuButtonNode, Element menuNode) {
    assert(_menuTimers[menuNode] != null);
    _menuTimers[menuNode].cancel();
  }
  void _onMenuMouseOut(Element menuButtonNode, Element menuNode) {
    _menuTimers[menuNode] = new Timer(_MENU_HIDE_DELAY, () =>
        menuNode.classes.add('hidden'));
  }

  // This will set up mouse over and mouse out event handlers on a menu button.
  void _registerMenuButtonEventHandlers(String menuId) {
    Element menuButtonNode = _getMenuButtonById(menuId);
    if (menuButtonNode == null) {
      print('Warning: no button found for menu ${menuId}');
    } else {
      Element menuNode = _menus[menuId];
      menuButtonNode.onMouseOver.listen(
          (_) => _onMenuButtonMouseOver(menuButtonNode, menuNode));
      menuButtonNode.onMouseOut.listen(
          (_) => _onMenuButtonMouseOut(menuButtonNode, menuNode));
    }
  }

  // DOM elements.
  final Element _overlayNode = querySelector('#overlay');
  // The currently active dialog's wrapper node.
  Element _activeDialogWrapperNode = null;
  // Handle to user manager instance.
  UserManager _userManager;
  // Maps menu IDs to menus.
  Map<String, Element> _menus = {};
  // Maps menu elements to timers for displaying / hiding menus.
  Map<Element, Timer> _menuTimers = {};
  // How long to wait before hiding a menu after mouse out.
  static const Duration _MENU_HIDE_DELAY = const Duration(milliseconds: 50);
  // Dialog ID of the sign in / out success dialogs.
  final String _SIGN_IN_SUCCESS_DIALOG = 'sign-in-success';
  final String _SIGN_OUT_SUCCESS_DIALOG = 'sign-out-success';
  // JavaScript parameters.
  static final JsObject _baseParams = context['BaseParams'];
}
