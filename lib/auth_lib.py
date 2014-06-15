# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                         Copyright (C) 2014 Chuan Ji                         #
#                             All Rights Reserved                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
"""Authentication library."""


import logging
import requests

from lib import models_lib


class AccountProvider(object):
  """Interface for authentication methods specific to an account provider."""

  def __init__(self, name):
    """Initializes the instance.

    Args:
      name: an identifier for this instance.
    """
    self.__name = name

  @property
  def name(self):
    """Returns the provided name for this instance."""
    return self.__name

  def IsTokenValid(self, user_id, token):
    """Returns whether the provided auth token is valid for the user.

    Args:
      user_id: a user ID from the account provider.
      token: an authentication token.
    """
    raise NotImplementedError()

  def GetGreetingName(self, account):
    """Returns an appropriate greeting name given account data.

    Args:
      account: an Account instance.
    Returns:
      A greeting name for the user.
    """
    raise NotImplementedError();


class GoogleAccountProvider(AccountProvider):
  """Handles authentication with Google."""

  # URL of the token validation API.
  _GOOGLE_TOKEN_VALIDATION_URL = (
      'https://www.googleapis.com/oauth2/v1/tokeninfo')

  def __init__(self, name):
    super().__init__(name)

  def IsTokenValid(self, user_id, token):
    response = requests.get(
        self._GOOGLE_TOKEN_VALIDATION_URL,
        params={'access_token': token}).json()
    if ('error' not in response and
        'user_id' in response and
        response['user_id'] == user_id):
      logging.info('Validated token for Google user ID %s', user_id)
      return True
    else:
      logging.error(
          'Failed token validation for Google user ID %s:\n%s',
          user_id, str(response))
      return False

  def GetGreetingName(self, account):
    # See https://developers.google.com/+/api/latest/people#resource.
    if account.data.get('nickname', None):
      return account.data['nickname']
    if account.data.get('name', {}).get('givenName', None):
      return account.data['name']['givenName']
    return account.data['displayName']


class FacebookAccountProvider(AccountProvider):
  """Handles authentication with Facebook."""

  # URL of the token validation API.
  _FACEBOOK_TOKEN_VALIDATION_URL = 'https://graph.facebook.com/debug_token'
  # Facebook app info.
  _FACEBOOK_APP_ID = '644477638972528'
  _FACEBOOK_APP_SECRET = '7102a0245be549ecca18cb173193885c'
  _FACEBOOK_ACCESS_TOKEN = '%s|%s' % (_FACEBOOK_APP_ID, _FACEBOOK_APP_SECRET)

  def __init__(self, name):
    super().__init__(name)

  def IsTokenValid(self, user_id, token):
    response = requests.get(
        self._FACEBOOK_TOKEN_VALIDATION_URL, params={
            'input_token': token,
            'access_token': self._FACEBOOK_ACCESS_TOKEN,
        }).json()
    if ('data' in response and
        'is_valid' in response['data'] and
        response['data']['is_valid'] and
        'user_id' in response['data'] and
        response['data']['user_id'] == user_id):
      logging.info('Validated token for Facebook user ID %s', user_id)
      return True
    else:
      logging.error(
          'Failed token validation for Facebook user ID %s:\n%s',
          user_id, str(response))
      return False

  def GetGreetingName(self, account):
    # See https://developers.facebook.com/docs/graph-api/reference/v2.0/user.
    if account.data.get('first_name', None):
      return account.data['first_name']
    if account.data.get('name_format', None):
      return account.data['name_format']
    return account.data['name']


# All account providers.
ACCOUNT_PROVIDERS = {
    'google': GoogleAccountProvider('google'),
    'facebook': FacebookAccountProvider('facebook'),
}


def FindOrCreateUser(account_data_list):
  """Looks up a user given a list of accounts.

  If none of the accounts in the list correspond to users, a new user will be
  created and associated with all of the accounts. If one or more of the
  accounts are associated with one user, and the other accounts are
  unassociated, the user will be associated with all accounts. If accounts are
  associated with more than one user, merge the users (this is not yet
  implemented).

  Args:
    A list of tuples of the form (account_provider_type, user_id) where
      - account_provider_type: type of the account provider.
      - user_id: the user's ID with the account provider.
      - account_data: extra data for this user obtained from the account
        provider. The format depends on the account provider.
  Returns:
    A User instance.
  """
  found_users = []
  accounts_to_add = []

  for account_provider_type, user_id, data in account_data_list:
    account_id = models_lib.Account.ToAccountId(account_provider_type, user_id)
    user = models_lib.User.objects(accounts__account_id=account_id).first()
    if user is None:
      account = models_lib.Account()
      account.account_provider_type = account_provider_type
      account.user_id = user_id
      account.account_id = models_lib.Account.ToAccountId(
          account_provider_type, user_id)
      account.data = data
      accounts_to_add.append(account)
    elif not any(found_user.id == user.id for found_user in found_users):
      found_users.append(user)

  if found_users:
    user = found_users[0]
    if len(found_users) > 1:
      # TODO(cji): Fix this.
      logging.error('Merging users not yet implemented!')
  else:
    user = models_lib.User(user_id=models_lib.User.NewUserId())

  if accounts_to_add:
    user.accounts.extend(accounts_to_add)
    user.greeting_name = ACCOUNT_PROVIDERS[
        user.accounts[0].account_provider_type].GetGreetingName(
            user.accounts[0])
    user.save()

  return user
