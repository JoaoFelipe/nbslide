import { CommandToolbarButton, ToolbarButton } from '@jupyterlab/apputils';
import { Cell, ICellModel } from '@jupyterlab/cells';
import { Notebook, NotebookActions, NotebookPanel } from '@jupyterlab/notebook';
import { ElementExt } from '@lumino/domutils';
import { PanelLayout } from '@lumino/widgets';
import { Commands } from './commands';

function isSlideCell(cell: Cell<ICellModel>): boolean {
  const slideshow = cell.model.metadata.get('slideshow');
  const slidetype = slideshow ? (slideshow as any).slide_type : null;
  return (
    slidetype === 'slide' ||
    slidetype === 'subslide' ||
    slidetype === 'fragment'
  );
}

function isSubSlide(cell: Cell<ICellModel>): boolean {
  const slideshow = cell.model.metadata.get('slideshow');
  const slidetype = slideshow ? (slideshow as any).slide_type : null;
  return slidetype === 'subslide';
}

function isMainSlide(cell: Cell<ICellModel>): boolean {
  const slideshow = cell.model.metadata.get('slideshow');
  const slidetype = slideshow ? (slideshow as any).slide_type : null;
  return slidetype === 'slide';
}

function isInvisibleCell(cell: Cell<ICellModel>): boolean {
  const slideshow = cell.model.metadata.get('slideshow');
  const slidetype = slideshow ? (slideshow as any).slide_type : null;
  return slidetype === 'skip' || slidetype === 'notes';
}

function isNoScroll(cell: Cell<ICellModel>): boolean {
  const tags = (cell.model.metadata.get('tags') as any[]) || [];
  return tags.includes('noscroll');
}

function skipExecution(cell: Cell<ICellModel>): boolean {
  const tags = (cell.model.metadata.get('tags') as any[]) || [];
  return cell.model.type !== 'code' || tags.includes('skiprun');
}

export class SlideControl {
  notebook: NotebookPanel;
  slidePosition: ToolbarButton;
  slideTitle: ToolbarButton;
  startButton: CommandToolbarButton;
  startCurrentButton: CommandToolbarButton;

  total: number;
  currentSlide: number;
  active: boolean;
  title: string;
  suffix: string;
  autosuffix: boolean;

  updateSlideShowConfig(cell: Cell<ICellModel>): void {
    const slideshow = cell.model.metadata.get('slideshow');
    if (!slideshow) {
      return;
    }
    const configs: any = slideshow;
    if (Object.prototype.hasOwnProperty.call(configs, 'slide_title')) {
      this.title = configs.slide_title;
    }
    if (Object.prototype.hasOwnProperty.call(configs, 'slide_suffix')) {
      this.suffix = configs.slide_suffix;
    }
    if (Object.prototype.hasOwnProperty.call(configs, 'slide_autosuffix')) {
      this.autosuffix = configs.slide_autosuffix;
    }
  }

  findSlideNumber = (index: number): number => {
    let total = 0;
    const cells = this.notebook.content.widgets;
    let result = 0;
    cells.forEach((cell: Cell<ICellModel>, currentindex: number) => {
      if (isSlideCell(cell)) {
        total += 1;
      }
      if (currentindex === index) {
        result = total;
      }
    });
    this.total = total;
    return result;
  };

  getSlideIndex = (index: number): number => {
    const cells = this.notebook.content.widgets;
    for (let i = index; i >= 0; i--) {
      const cell = cells[i];
      if (isSlideCell(cell)) {
        return i;
      }
    }
    return 0;
  };

  viewSlide = (firstIndex: number): number => {
    const cells = this.notebook.content.widgets;
    let index = firstIndex;
    if (isSubSlide(cells[index])) {
      let subindex = index;
      do {
        subindex = this.getSlideIndex(subindex - 1);
        this.hideSlide(subindex);
      } while (subindex !== 0 && !isMainSlide(cells[subindex]));
    }
    let noScroll = false;
    do {
      const cell = cells[index];
      noScroll = noScroll || isNoScroll(cell);
      if (!isInvisibleCell(cell)) {
        cell.show();
      }
      this.updateSlideShowConfig(cell);
      if (this.autosuffix && cell.model.type === 'markdown') {
        const nodes = cell.node.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (nodes.length !== 0) {
          const el = nodes[0];
          const suffix = el.textContent;
          if (suffix !== null) {
            this.suffix = suffix.replace('¶', '');
          }
        }
      }
      this.updateSlideShowConfig(cell);
      if (!noScroll) {
        ElementExt.scrollIntoViewIfNeeded(
          this.notebook.content.node,
          cell.node
        );
      }
      index++;
    } while (index < cells.length && !isSlideCell(cells[index]));
    if (!noScroll) {
      ElementExt.scrollIntoViewIfNeeded(
        this.notebook.content.node,
        cells[firstIndex].node
      );
    }
    this.updateSlideTitle();
    return index;
  };

  setSlideTitle(title: string): void {
    (this.slideTitle as any).props.label = title;
    this.slideTitle.update();
  }

  updateSlideNumber(): void {
    this.setSlideNumber(this.currentSlide + '/' + this.total);
  }

  updateSlideTitle(): void {
    this.setSlideTitle(this.title + (this.suffix ? ` - ${this.suffix}` : ''));
  }

  setSlideNumber(number: string): void {
    (this.slidePosition as any).props.label = number;
    this.slidePosition.update();
  }

  monitorProgression = (sender: Notebook, cell: Cell<ICellModel>): void => {
    if (this.active) {
      this.currentSlide = this.findSlideNumber(sender.activeCellIndex);
      this.updateSlideNumber();
    }
  };

  startFirst = (): void => {
    let first = -1;
    const cells = this.notebook.content.widgets;
    cells.forEach((cell: Cell<ICellModel>, index: number) => {
      if (isSlideCell(cell) && first === -1) {
        first = index;
      }
    });
    if (first === -1) {
      first = 0;
    }
    this.notebook.content.activeCellIndex = first;
    this.startPresentation();
  };

  startPresentation = (): void => {
    (this.notebook.toolbar.layout as PanelLayout).widgets.forEach(
      (toolbaritem, index) => {
        if (!toolbaritem.hasClass('jp-Toolbar-spacer')) {
          toolbaritem.hide();
        }
      }
    );
    this.slidePosition.show();
    this.slideTitle.show();

    this.active = true;
    this.notebook.content.activeCellChanged.connect(this.monitorProgression);

    const currentSlide = this.getSlideIndex(
      this.notebook.content.activeCellIndex
    );
    const cells = this.notebook.content.widgets;
    for (let index = 0; index < cells.length; index) {
      if (index <= currentSlide) {
        index = this.viewSlide(index);
      } else {
        cells[index].hide();
        index++;
      }
    }

    this.notebook.content.scrollToCell(cells[currentSlide]);
    this.notebook.content.activeCellIndex = currentSlide;
    this.currentSlide = this.findSlideNumber(currentSlide);
    this.updateSlideNumber();
    this.updateSlideTitle();

    document.documentElement.requestFullscreen();
    this.notebook.content.deselectAll();
    //alert('ok ' + this.title);
  };

  stopPresentation = (): void => {
    (this.notebook.toolbar.layout as PanelLayout).widgets.forEach(
      (toolbaritem, index) => {
        toolbaritem.show();
      }
    );
    this.slidePosition.hide();
    this.slideTitle.hide();

    const cells = this.notebook.content.widgets;
    cells.forEach((cell: Cell<ICellModel>, index: number) => {
      cell.show();
    });

    this.active = false;

    this.notebook.content.activeCellChanged.disconnect(this.monitorProgression);

    if (document.fullscreenElement !== null) {
      document.exitFullscreen();
    }
  };

  viewCurrentSlide = (): void => {
    this.viewSlide(this.notebook.content.activeCellIndex);
  };

  hideSlide = (firstIndex: number): void => {
    const cells = this.notebook.content.widgets;
    cells[firstIndex].hide();
    for (let index = firstIndex + 1; index < cells.length; index++) {
      if (isSlideCell(cells[index])) {
        break;
      }
      cells[index].hide();
    }
  };

  previousSlide = (): void => {
    const cells = this.notebook.content.widgets;
    const firstIndex = this.getSlideIndex(
      this.notebook.content.activeCellIndex
    );
    if (firstIndex === 0) {
      ElementExt.scrollIntoViewIfNeeded(
        this.notebook.content.node,
        cells[firstIndex].node
      );
      return;
    }
    this.hideSlide(firstIndex);
    const previousIndex = this.getSlideIndex(firstIndex - 1);
    this.viewSlide(previousIndex);
    ElementExt.scrollIntoViewIfNeeded(
      this.notebook.content.node,
      cells[previousIndex].node
    );
    this.notebook.content.activeCellIndex = previousIndex;
    this.viewCurrentSlide();
  };

  nextSlide = (): void => {
    const cells = this.notebook.content.widgets;
    let index = this.notebook.content.activeCellIndex;
    if (cells[index].isHidden) {
      index = this.getSlideIndex(index);
    } else {
      for (index = index + 1; index < cells.length; index++) {
        if (isSlideCell(cells[index])) {
          break;
        }
      }
      if (index === cells.length) {
        index -= 1;
      }
    }
    const shouldRun = cells[index].isHidden;
    const start = index;
    this.viewSlide(index);

    do {
      if (shouldRun && !skipExecution(cells[index])) {
        this.notebook.content.activeCellIndex = index;
        NotebookActions.run(
          this.notebook.content,
          this.notebook.sessionContext
        );
      }
      index++;
    } while (index < cells.length && !isSlideCell(cells[index]));

    this.notebook.content.activeCellIndex = start;
  };

  dispose(): void {
    this.slidePosition.dispose();
    this.slideTitle.dispose();
    this.startButton.dispose();
    this.startCurrentButton.dispose();
  }

  constructor(notebook: NotebookPanel, commands: Commands) {
    this.currentSlide = 0;
    this.total = 0;
    this.notebook = notebook;
    this.active = false;
    this.title = notebook.title.label;
    this.suffix = '';
    this.autosuffix = true;

    this.slidePosition = new ToolbarButton({
      className: 'positionSlideshow',
      onClick: this.stopPresentation,
      tooltip: 'Stop presentation',
      label: '1'
    });
    this.slidePosition.hide();

    this.slideTitle = new ToolbarButton({
      className: 'titleSlideshow',
      onClick: this.stopPresentation,
      tooltip: 'Stop presentation',
      label: notebook.title.label
    });
    this.slideTitle.hide();

    this.startButton = new CommandToolbarButton({
      commands: commands.commands,
      id: 'nbslide:start-begin'
    });
    this.startButton.addClass('jp-nbslide-nbtoolbarbutton');

    this.startCurrentButton = new CommandToolbarButton({
      commands: commands.commands,
      id: 'nbslide:start-current'
    });
    this.startCurrentButton.addClass('jp-nbslide-nbtoolbarbutton');

    notebook.toolbar.insertItem(0, 'nbslide-current', this.startCurrentButton);
    notebook.toolbar.insertItem(0, 'nbslide-slideshow', this.startButton);
    notebook.toolbar.insertItem(0, 'nbslide-position', this.slidePosition);
    notebook.toolbar.insertItem(
      (notebook.toolbar.layout as PanelLayout).widgets.length - 1,
      'nbslide-title',
      this.slideTitle
    );
  }
}
