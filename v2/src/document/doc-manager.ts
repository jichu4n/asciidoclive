import {action, autorun, observable} from 'mobx';
import {AsyncAsciidocCompiler} from './asciidoc-compiler';
import {OutputType} from './compiler';
import {CompilerClient} from './compiler-client';
import {Doc, DocData} from './doc';

export default class DocManager {
  public doc = observable.object(new Doc());

  constructor() {
    autorun(() => {
      this.compilerClient.addRequest({
        body: this.doc.body,
        outputType: OutputType.PREVIEW,
      });
    });
  }

  @action
  setDocData(docData: DocData) {
    Object.assign(this.doc, docData);
  }

  @action
  setBody(body: string) {
    this.doc.body = body;
  }

  @action
  private setCompiledBody(compiledBody: string) {
    this.doc.compiledBody = compiledBody;
  }

  private readonly compilerClient = new CompilerClient(
    new AsyncAsciidocCompiler(),
    ({compiledBody}) => this.setCompiledBody(compiledBody)
  );
}
