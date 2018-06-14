import {observable} from 'mobx';

export default class Doc {
  @observable title: string;
  @observable body: string;
  @observable compiledBody: string;
  @observable isDirty: boolean;

  // TODO
  private compiler: any;

  constructor(compiler: any) {
    this.compiler = compiler;
  }
}
