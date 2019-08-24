class Environment {
  get rootUrl() {
    return process.env.REACT_APP_ROOT_URL;
  }
  getAbsoluteUrl(path: string) {
    return new URL(path, this.rootUrl).toString();
  }
  get siteTitle() {
    return process.env.REACT_APP_SITE_TITLE;
  }
  get siteDisplayName() {
    return process.env.REACT_APP_SITE_DISPLAY_NAME;
  }
  get dropboxApiKey() {
    return process.env.REACT_APP_DROPBOX_APP_KEY;
  }
  get googleDriveClientId() {
    return process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID;
  }
  get googleDriveApiKey() {
    return process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
  }
}

const environment = new Environment();
export default environment;
