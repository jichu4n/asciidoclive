class Environment {
  get dropboxApiKey() {
    return process.env.REACT_APP_DROPBOX_APP_KEY;
  }
  get rootUrl() {
    return process.env.REACT_APP_ROOT_URL;
  }
  getAbsoluteUrl(path: string) {
    return new URL(path, this.rootUrl).toString();
  }
  get siteDisplayName() {
    return process.env.REACT_APP_SITE_DISPLAY_NAME;
  }
}

const environment = new Environment();
export default environment;
