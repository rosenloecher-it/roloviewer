import React from 'react';
import PropTypes from 'prop-types';
import path from 'path'
import {connect} from "react-redux";
import { Icon } from '@blueprintjs/core';
import log from 'electron-log';
import * as constants from "../../common/constants";
import * as stringUtils from "../../common/utils/stringUtils";

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

  pushTableLine(tableLines, description, input) {
    if (!input)
      return;

    const key = description;

    let objectsFill = null;
    if (typeof(input) === typeof('string'))
      objectsFill = stringUtils.shortenString(input.toString(), this.props.detailsShortenText);
    else
      objectsFill = input;

    tableLines.push( <tr key={key}><td>{description}</td><td>{objectsFill}</td></tr> );
  }

  // ......................................................

  render() {
    const func = '.render';

    try {
      const {props} = this;
      const cssTableClass = "popover-table";
      const cssPositionClass = props.detailsPosition;

      let item = null;
      // if (props.itemIndex >= 0 && props.itemIndex < props.items.length)
      //   item = props.items[props.itemIndex];

      item = props.currentItem;

      const showIcons = props.combinedAutoPlay || props.random;

      if (props.detailsState === constants.DETAILS_STATE_OFF && !showIcons)
        return null; // show nothing

      const tableLines = [];

      const iconSize = 16;
      const colorDefault = 'white';
      const colorInactive = 'grey';
      const colorRandom = props.combinedAutoPlay ? colorDefault : colorInactive;
      const iconAutoPlay = (props.combinedAutoPlay && <Icon icon="play" iconSize={iconSize} color={colorDefault} />);
      const iconRandom = (props.random && <Icon icon="random" iconSize={iconSize} color={colorRandom} />);

      if (props.detailsState === constants.DETAILS_STATE_OFF && showIcons)
        tableLines.push(<tr key="autoPlay"><td>{iconRandom} {iconAutoPlay}</td></tr>);

      if (props.detailsState !== constants.DETAILS_STATE_OFF && item && item.file) {
        const numberText = `${props.itemNumber}/${props.itemCount}`;

        let conainterIcon = null;
        switch (props.containerType) {
          case constants.CONTAINER_AUTOSELECT: conainterIcon = <Icon icon="database" />; break;
          case constants.CONTAINER_FOLDER: conainterIcon = <Icon icon="folder-open" />; break;
          case constants.CONTAINER_PLAYLIST: conainterIcon = <Icon icon="list" />; break;
          case constants.CONTAINER_CLIPBOARD: conainterIcon = <Icon icon="clipboard" />; break;
          default: conainterIcon = <Icon icon="help" />; break;
        }

        this.pushTableLine(tableLines, "Status", <div>{conainterIcon} {numberText} {iconRandom} {iconAutoPlay}</div>);
        const shortenedPath = stringUtils.shortenPath(path.dirname(item.file), -1 *this.props.detailsShortenText);
        this.pushTableLine(tableLines, "Folder", shortenedPath);
        this.pushTableLine(tableLines, "Filename", path.basename(item.file));
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
        if (meta.time) {
          const dateObj = new Date(meta.time);
          dateText = dateObj.toLocaleString();
        }

        this.pushTableLine(tableLines, "Date", dateText);
        this.pushTableLine(tableLines, "Rating", rating);

        this.pushTableLine(tableLines, "Size", meta.imageSize);

        this.pushTableLine(tableLines, "Camera", meta.cameraModel);
        this.pushTableLine(tableLines, "Lens", meta.cameraLens);

        this.pushTableLine(tableLines, "Settings", meta.photoSettings);
        this.pushTableLine(tableLines, "Location", meta.gpsLocation);
        this.pushTableLine(tableLines, "GPS-Position", meta.gpsPosition);

      }
      //log.debug(`${_logKey}.render - state=${state}, showAll=${showAll}, showPath=${showPath}, itemPath=`, itemPath);

      return (
        <div className={cssPositionClass}>
          <table className={cssTableClass}>
            <tbody key="tbody">
              {tableLines}
            </tbody>
          </table>
        </div>
      );
    } catch(err) {
      log.error(`${_logKey}${func} -`, err);

      return null;
    }
  }

}

// ----------------------------------------------------------------------------------

DetailsOverlay.propTypes = {
  detailsShortenText: PropTypes.number
};

DetailsOverlay.defaultProps = {
  detailsShortenText: constants.DEFCONF_DETAILS_TEXT_SHORTEN,
};

const mapStateToProps = state => ({
  combinedAutoPlay: state.slideshow.autoPlay || state.context.isScreensaver,
  containerType: state.renderer.containerType,
  detailsPosition: state.slideshow.detailsPosition,
  detailsShortenText: state.slideshow.detailsShortenText,
  detailsState: state.slideshow.detailsState,
  currentItem: state.status.currentItem,
  itemNumber: state.renderer.itemIndex + 1 + state.renderer.countRemovedItems,
  itemCount: state.renderer.items.length + state.renderer.countRemovedItems,
  itemIndex: state.renderer.itemIndex,
  items: state.renderer.items,
  random: state.slideshow.random,
});


export default connect( mapStateToProps )(DetailsOverlay);
