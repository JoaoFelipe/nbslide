# nbslide

![Github Actions Status](https://github.com/JoaoFelipe/nbslide/workflows/Build/badge.svg)

Slideshow extension for JupyterLab. This extension adds a presentation mode for Jupyter Lab that hides cells during a presentation to help the audience focus on the part that matters.

In comparison to [RISE](https://github.com/damianavila/RISE), *nbslide* is a simpler extension that keeps the notebook look and feel and executes cells automatically during the presentation mode.

## Why did you make this?

RISE is a great tool for general presentations, but the usage of `reveal.js` makes it not look much like a notebook. I was [preparing a presentation](https://github.com/opgabriel/jai2021-jupyter) that introduces Jupyter and faced the dilemma of using RISE and losing the look of a notebook, or running the notebook directly and losing the focus of the audience. 

Additionally, I had made a similar extension for [old jupyter notebooks before](https://github.com/JoaoFelipe/minicurso-mineracao-interativa/blob/master/slide.py) when I faced the same dilemma in a previous presentation. Thus, I decided to port it to Jupyter Lab, extend it to support the configuration of Slides, and make it more generic.

## Usage

For configuring the Slideshow, *nbslide* uses the [same options](https://rise.readthedocs.io/en/stable/usage.html) in the "Cell Toolbar" as RISE. However, the types may have a slightly different behavior:

- **slide**: this cell is the beginning of a new slide (same behavior)
- **subslide**: this cell is also the beginning of a new slide, but displaying it hides everything up to (and including) its main **slide**. It is useful for presenting changes on cells, since the default definition of slides displays them all sequentially.
- **fragment**: this cell can be part of a slide or a subslide. It is hidden at first glance, but becomes visible once you advance the slide (same behavior as RISE). Note that in our case the behavior is not much different than setting a cell as a new **slide**. However, a **fragment** is also hidden for the exihibition of a **subslide**.
- **skip**: this cell is ignored and never displayed during the presentation (same behavior as RISE).
- **notes**: currently, *nbslide* does not have a speaker view, so it is the same as **skip**.

### Additional configurations

In addition to these cell types it is also possible to add tags to cells for additional behaviors:

- **skiprun**: prevents code cell from running during the slide display
- **noscroll**: prevents the notebook scroll to move to the cell during the slide display

Finally, it is also possible to include additional properties to the `"slideshow"` metadata in the cell:

- `slide_title`: defines the current slide title. By default, it uses the notebook name.
- `slide_suffix`: defines the suffix of the title. By default, it reads and updates from Header elements.
- `slide_autosuffix`: deactivate (and reactivate) the update of suffixes based on header elements.

### Shortcuts

The default shortcuts of *nbslide* are also different than the ones from RISE. We borrow shortcuts from Google presentations/Powerpoint:

- `Ctrl+F5`: Start/Stop presentation in the current slide.
- `Ctrl+Shift+F5`: Start presentation from the first slide.
- `Right Arrow`: Move to the next slide. If it is hidden, *nbslide* executes all of its cells.
- `Left Arrow`: Hide current slide and go to the previous one.
- `\`: Display current slide withou trying to execute it. Note that it is possible to use `Down` and `Up` arrows to navigate normally on the cells of the notebook, including the ones that are hidden.

## Requirements

* JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
pip install nbslide
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall nbslide
```

## Contributing

Feel free to submit pull requests and open issues.

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the nbslide directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall nbslide
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `nbslide` within that folder.
