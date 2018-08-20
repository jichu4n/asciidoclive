import {observable} from 'mobx';

export default class Doc {
  @observable
  public title: string;
  @observable
  public body: string;
  @observable
  public compiledBody: string;
  @observable
  public isDirty: boolean;

  // TODO
  // private compiler: any;

  constructor(compiler: any) {
    // this.compiler = compiler;
  }
}
