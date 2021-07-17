import { JupyterFrontEnd } from "@jupyterlab/application";
import { ICommandPalette } from "@jupyterlab/apputils";
import { INotebookTracker } from "@jupyterlab/notebook";
import { CommandRegistry } from "@lumino/commands";
import { nbslideCurrentIcon, nbslideStartIcon } from "./iconimport";
import { SlideControl } from "./slidecontrol";


export class Commands {

    nbslides: SlideControl[];
    tracker: INotebookTracker;
    commands: CommandRegistry;



    constructor(app: JupyterFrontEnd, pallete: ICommandPalette, tracker: INotebookTracker) {
        this.nbslides = [];
        this.tracker = tracker;
        this.commands = app.commands;

        this.commands.addCommand('nbslide:start-current', {
            label: "Start presentation in the current Slide",
            icon: nbslideCurrentIcon,
            isEnabled: () => true,
            isVisible: () => true,
            execute: () => {
                if (this.activeSlideControl()?.active) {
                    this.activeSlideControl()?.stopPresentation();
                } else {
                    this.activeSlideControl()?.startPresentation();
                }
            }
        });
        pallete.addItem({
            command: 'nbslide:start-current',
            category: 'nbslide-shortcut'
        })

        this.commands.addCommand('nbslide:start-begin', {
            label: "Start presentation from the first slide",
            icon: nbslideStartIcon,
            isEnabled: () => true,
            isVisible: () => true,
            execute: () => {
                if (this.activeSlideControl()?.active) {
                    this.activeSlideControl()?.stopPresentation();
                } else {
                    this.activeSlideControl()?.startFirst();
                }
            }
        });
        pallete.addItem({
            command: 'nbslide:start-begin',
            category: 'nbslide-shortcut'
        })

        this.commands.addCommand('nbslide:show-all', {
            label: "Stop presentation",
            isEnabled: () => this.isActive(),
            isVisible: () => this.isActive(),
            execute: () => {
                this.activeSlideControl()?.stopPresentation();
            }
        });
        pallete.addItem({
            command: 'nbslide:show-all',
            category: 'nbslide-shortcut'
        })

        this.commands.addCommand('nbslide:show-selected', {
            label: "Show current slide",
            isEnabled: () => this.isActive(),
            isVisible: () => this.isActive(),
            execute: () => {
                this.activeSlideControl()?.viewCurrentSlide();
            }
        });
        pallete.addItem({
            command: 'nbslide:show-selected',
            category: 'nbslide-shortcut'
        })

        this.commands.addCommand('nbslide:previous-slide', {
            label: "Hide current slide and go to previous one",
            isEnabled: () => this.isActive(),
            isVisible: () => this.isActive(),
            execute: () => {
                this.activeSlideControl()?.previousSlide();
            }
        });
        pallete.addItem({
            command: 'nbslide:previous-slide',
            category: 'nbslide-shortcut'
        })

        this.commands.addCommand('nbslide:next-slide', {
            label: "Go to next slide",
            isEnabled: () => this.isActive(),
            isVisible: () => this.isActive(),
            execute: () => {
                this.activeSlideControl()?.nextSlide();
            }
        });
        pallete.addItem({
            command: 'nbslide:next-slide',
            category: 'nbslide-shortcut'
        })

    }

    isActive = (): boolean => {
        let slideControl = this.activeSlideControl();
        if (slideControl != null) {
            return slideControl.active;
        }
        return false;
    }

    activeSlideControl = (): SlideControl | null => {
        let notebook = this.tracker.currentWidget;
        let result = null;
        this.nbslides.forEach((control, index) => {
            if (control.notebook == notebook) {
                result = control;
            }
        })
        return result;
    }

    register(nbslide: SlideControl) {
        this.nbslides.push(nbslide);
    }

    unregister(nbslide: SlideControl) {
        this.nbslides = this.nbslides.filter((value, index, arr) => value != nbslide);
    }
}