class Environment {
  get rootUrl() {
    return window.location.origin;
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
  get googleDriveAppId() {
    return this.googleDriveClientId && this.googleDriveClientId.split('-')[0];
  }
}

const environment = new Environment();
export default environment;
