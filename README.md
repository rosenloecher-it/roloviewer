![License][license-image]

# RoloViewer

### And yet another image viewer...

<br/>

![screenshot](./screenshot.jpg)

## Features

- supports ICC color profiles
- fullscreen modus available
- transitions (at moment only crossfades; more are planed)
- integrate Exiftool to view image details (date, rating, camera + lense models, gps location)
- open image location in browser (if any; predefined is openstreetmap)
- supported image formats: at moment only jpegs (more are coming)
- configuration via file (ini style) and some command line options
- runs on Linux and Windows
- **main purpose** - show automatically your pictures spread over a huge amount of (sub-)directories
    - crawles down one or more root directories, (auto-)select (randomly) a handful pictures from one folder
      and proceeds than with annother randomly selected folder
    - filter directories by name snippets (white- and blacklists)
    - filter images by rating or tags (xmp; white- and blacklists)
    - favors images by rating
    - (minimises headache caused by context jumping...)
- screensaver mode: finishs at the first mouse move or key press
- able to block the system power saving for some time
- drop images or directories onto the surface


## Usage



### Configuration via file

[crawler]
batchCount=10
databasePath=/home/raul/.config/RoloViewer
folderSource[]=/home/data/mymedia/201x/
maxItemsPerContainer=null
updateDirsAfterMinutes=1440
weightingRating=60
weightingRepeated=15
weightingSeason=360
weightingSelPow=3


[slideshow]
autoPlay=true
crawlerInfoPosition=popover-right-bottom
crawlerInfoShow=true
detailsPosition=popover-left-bottom
detailsShortenText=50
detailsState=ALL
lastContainer=null
lastContainerType=1
lastItem=/home/data/mymedia/201x/2013/20131115 Sammelsurium/20131120-1521-2282.jpg
random=false
timer=7000
transitionTimeAutoPlay=3000
transitionTimeManual=600

[system]
exiftool=.
lastDialogFolder=/home/data/mymedia/201x/2015
logfile=/home/raul/.config/RoloViewer/roloviewer.log
logLevelConsole=debug
logLevelFile=debug
powerSaveBlockTime=150
mapUrlFormat="http://www.openstreetmap.org/?mlat=$LATI_NUM$>&mlon=$LONG_NUM$&zoom=15&layers=M"


### Configuration via command line arguments



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
