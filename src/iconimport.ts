import { LabIcon } from '@jupyterlab/ui-components';

import nbslideStartstr from '../style/img/start.svg';
import nbslideCurrentstr from '../style/img/current.svg';

export const nbslideStartIcon = new LabIcon({
  name: 'nbslide:starticon',
  svgstr: nbslideStartstr,
});

export const nbslideCurrentIcon = new LabIcon({
  name: 'nbslide:currenticon',
  svgstr: nbslideCurrentstr,
});