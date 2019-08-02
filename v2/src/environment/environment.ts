class Environment {
  get dropboxApiKey() {
    return process.env.REACT_APP_DROPBOX_APP_KEY || null;
  }
}

const environment = new Environment();
export default environment;
