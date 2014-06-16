/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                         Copyright (C) 2014 Chuan Ji                         *
 *                             All Rights Reserved                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 Base class for pages.
*/

import 'dart:async';
import 'dart:convert';
import 'dart:html';
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
    _userManager = new UserManager(() {
      postJson(_AUTH_STATE_CHANGE_REFRESH_UI, {}, _onAuthStateChangeRefresh);
      _signInWindowWrapperNode.classes.add('hidden');
    });
    _registerHeaderEventListeners();
    _setUpAccountMenu();
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

  // Callback invoked when we receive changed UI elements following auth state
  // change.
  void _onAuthStateChangeRefresh(Map response) {
    if (response['success']) {
      print('Refreshing page elements following auth state change');
      // Refresh header and re-register event handlers, as the old elements have
      // been deleted along with any event handlers.
      replaceWithHtml('#header', response['header']);
      _registerHeaderEventListeners();
      // Re-register menu buttons.
      for (String menuId in _menus.keys) {
        _registerMenuButtonEventHandlers(menuId);
      }
    } else {
      print('Failed to refresh on auth state change. Error: ' +
            response['error_message']);
    }
    _overlayNode.classes.add('hidden');
  }

  // Attaches event handlers for the header.
  void _registerHeaderEventListeners() {
    querySelector('#sign-in-button').onClick.listen((_) {
      _overlayNode.classes.remove('hidden');
      _signInWindowWrapperNode.classes.remove('hidden');
    });
    /*
    querySelector('#sign-out-launcher').onClick.listen((_) {
      print('Clicked');
      _userManager.logout();
    });
    */
    querySelector('#sign-in-window .ui-button-cancel').onClick.listen((_) {
      _signInWindowWrapperNode.classes.add('hidden');
      _overlayNode.classes.add('hidden');
    });
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

  // Auth state change refresh API.
  final String _AUTH_STATE_CHANGE_REFRESH_UI =
      '/api/v1/auth_state_change_refresh';
  // DOM elements.
  final Element _overlayNode = querySelector('#overlay');
  final Element _signInWindowWrapperNode =
      querySelector('#sign-in-window-wrapper');
  // Handle to user manager instance.
  UserManager _userManager;
  // Maps menu IDs to menus.
  Map<String, Element> _menus = {};
  // Maps menu elements to timers for displaying / hiding menus.
  Map<Element, Timer> _menuTimers = {};
  // How long to wait before hiding a menu after mouse out.
  static const Duration _MENU_HIDE_DELAY = const Duration(milliseconds: 50);
}
