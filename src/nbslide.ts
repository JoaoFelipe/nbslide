
import { DocumentRegistry } from "@jupyterlab/docregistry";
import { INotebookModel, NotebookPanel } from "@jupyterlab/notebook";
import { DisposableDelegate, IDisposable } from "@lumino/disposable";
import { Commands } from "./commands";
import { SlideControl } from "./slidecontrol";

export class NbSlide
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  commands: Commands;

  constructor(commands: Commands) {
    this.commands = commands;
  }

  createNew(widget: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    //eval("window.widget = widget;");
    //eval("window.context = context;");
    let slideControl = new SlideControl(widget, this.commands);
    this.commands.register(slideControl);
    return new DisposableDelegate(() => {
      slideControl.dispose();
      this.commands.unregister(slideControl);
    });
  }

}
