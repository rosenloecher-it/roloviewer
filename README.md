![License][license-image]

# RoloViewer

### And yet another image viewer...

<br/>


## Features

- supports ICC color profiles
- fullscreen modus available
- transitions (at moment only crossfades; more are planed)
- integrate Exiftool to view image details (date, rating, camera + lense models, gps location)
- open image location in browser (if any; predefined is openstreetmap)
- supported image formats: at moment only jpegs (more are coming)
- configuration via file (ini style) and some command line options
- run on Linux and Windows
- crawler mode
    - auto select images from directory hierarchy.

## Configuration

### Via file


### Via command line arguments



## Tipps & tricks

- Suppress questions for integrating the AppImage into your linux system:

        ```bash
        $ mkdir -p $HOME/.local/share/appimagekit/
        $ touch $HOME/.local/share/appimagekit/no_desktopintegration
        ```


## Based on

- [Electron](http://electron.atom.io/)
- [chentsulin/electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate)
- React
- Exiftool


## Maintainers

- [Raul Rosenlöcher](https://github.com/rosenloecher-it)


## License

MIT © [Raul Rosenlöcher](https://github.com/rosenloecher-it)

The code is available at [GitHub][home].


[home]: https://github.com/rosenloecher-it/roloviewer
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
