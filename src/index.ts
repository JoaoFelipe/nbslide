import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Commands } from './commands';
import { NbSlide } from './nbslide';



/**
 * Initialization data for the nbslide extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'nbslide:plugin',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker],
  activate: (app: JupyterFrontEnd, pallete: ICommandPalette, tracker: INotebookTracker) => {
    console.log('JupyterLab extension nbslide is activated!');
    let commands = new Commands(app, pallete, tracker);
    app.docRegistry.addWidgetExtension('Notebook', new NbSlide(commands));
  }
};



export default plugin;
