import React from 'react';
import {connect} from "react-redux";
import { Icon } from '@blueprintjs/core';
import log from 'electron-log';
import * as constants from "../../common/constants";
import {determinePathAndFilename} from "../../common/utils/transfromPath";
import {valiInt} from "../../common/utils/validate";
import {validateExifDate} from "../../worker/crawler/metaReader";

// ----------------------------------------------------------------------------------

const _logKey = "detailsOverlay";

// ----------------------------------------------------------------------------------

class DetailsOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.render = this.render.bind(this);
    this.pushTableLine = this.pushTableLine.bind(this);
  }

  // .......................................................

  pushTableLine(tableLines, description, text) {
    if (!text)
      return;

    tableLines.push( <tr key={description}><td>{description}</td><td>{text}</td></tr> );
  }

  // ......................................................

  render() {

    const shortenPathNum = 4;

    const {props} = this;
    const cssTableClass = "popover-table";
    const cssPositionClass = props.detailsPosition;

    let item = null;
    if (props.itemIndex >= 0 && props.itemIndex < props.items.length)
      item = props.items[props.itemIndex];

    if (props.detailsState === constants.DETAILS_STATE_OFF && !props.autoPlay)
      return null; // show nothing

    const tableLines = [];

    if (props.detailsState === constants.DETAILS_STATE_OFF && props.autoPlay)
      tableLines.push(<tr key="autoPlay"><td><Icon icon="play" /></td></tr>);

    if (props.detailsState !== constants.DETAILS_STATE_OFF && item && item.file) {
      const itemPath = determinePathAndFilename(item, shortenPathNum);
      const numberText = `${props.itemIndex + 1}/${props.items.length}`;
      const autoPlayIcon = (props.autoPlay && <Icon icon="play" />);

      let conainterIcon = null;
      switch (props.containerType) {
        case constants.CONTAINER_AUTOSELECT: conainterIcon = null; break;
        case constants.CONTAINER_FOLDER: conainterIcon = <Icon icon="folder-open" />; break;
        case constants.CONTAINER_PLAYLIST: conainterIcon = <Icon icon="list" />; break;
        default: conainterIcon = <Icon icon="help" />; break;
      }

      this.pushTableLine(tableLines, "Status", <div>{conainterIcon} {numberText} {autoPlayIcon}</div>);
      this.pushTableLine(tableLines, "Folder", itemPath.dir);
      this.pushTableLine(tableLines, "Filename", itemPath.filename);
    }

    if (props.detailsState === constants.DETAILS_STATE_ALL && item && item.meta) {
      const { meta } = item;

      let rating = null;
      if (meta.rating) {
        rating = "";
        for (let i = 0; i < meta.rating; i++)
          rating += "*";
      }

      let dateText = null;
      if (meta.date) {
        const dateObj = new Date(meta.date);
        dateText = dateObj.toLocaleString();
      }

      this.pushTableLine(tableLines, "Date", dateText);
      this.pushTableLine(tableLines, "Rating", rating);

      this.pushTableLine(tableLines, "Size", meta.imageSize);

      this.pushTableLine(tableLines, "Camera", meta.cameraModel);
      this.pushTableLine(tableLines, "Lens", meta.cameraLens);

      this.pushTableLine(tableLines, "Settings", meta.photoSettings);
      // this.pushTableLine(tableLines, "ShutterSpeed", meta.photoShutterSpeed);
      // this.pushTableLine(tableLines, "Aperture", meta.photoAperture);
      // this.pushTableLine(tableLines, "ISO", meta.photoISO);
      //this.pushTableLine(tableLines, "Flash", meta.photoFlash);
      this.pushTableLine(tableLines, "Location", meta.gpsLocation);
      this.pushTableLine(tableLines, "GPS-Position", meta.gpsPosition);

    }
    //log.debug(`${_logKey}.render - state=${state}, showAll=${showAll}, showPath=${showPath}, itemPath=`, itemPath);

    return (
      <div className={cssPositionClass}>
        <table className={cssTableClass}><tbody key="tbody">
          {tableLines}
        </tbody></table>
      </div>
    );
  }

}

// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
  autoPlay: state.slideshow.autoPlay,
  containerType: state.slideshow.containerType,
  detailsPosition: state.slideshow.detailsPosition,
  detailsState: state.slideshow.detailsState,
  items: state.slideshow.items,
  itemIndex: state.slideshow.itemIndex,
});


export default connect( mapStateToProps )(DetailsOverlay);
