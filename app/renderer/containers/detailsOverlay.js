import React from 'react';
import {connect} from "react-redux";
import { Icon } from '@blueprintjs/core';
import log from 'electron-log';
import * as constants from "../../common/constants";
import {determinePathAndFilename} from "../../common/transfromPath";

// ----------------------------------------------------------------------------------

const _logKey = "detailsOverlay";

// ----------------------------------------------------------------------------------

class DetailsOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.render = this.render.bind(this);
    this.renderTableLine = this.renderTableLine.bind(this);
  }

  // .......................................................

  renderTableLine(doShow, description, text) {
    if (!doShow || !text)
      return null;

    return (
      <tr><td>{description}</td><td>{text}</td></tr>
    );
  }

  // .......................................................

  render() {

    const shortenPathNum = 4;

    const {props} = this;
    const cssTableClass = "popover-table";
    const cssPositionClass = props.detailsPosition;

    let item = null;
    if (props.showIndex >= 0 && props.showIndex < props.items.length)
      item = props.items[props.showIndex];

    let state = props.detailsState;
    if (!item || !item.file)
      state = constants.DETAILS_STATE_OFF;
    //else if (!item.details && state === constants.DETAILS_STATE_ALL)
    //  state = constants.DETAILS_STATE_MIN;

    if (state === constants.DETAILS_STATE_OFF && !props.autoPlay)
      return null; // show nothing

    const showAll = (state === constants.DETAILS_STATE_ALL);
    const showPath = (state === constants.DETAILS_STATE_MIN) || showAll;

    let itemPath = null;
    if (showPath)
      itemPath = determinePathAndFilename(item, shortenPathNum);
    else
      itemPath = {};

    //log.debug(`${_logKey}.render - state=${state}, showAll=${showAll}, showPath=${showPath}, itemPath=`, itemPath);

    return (
      <div className={cssPositionClass}>
        <table className={cssTableClass}><tbody>

          {props.autoPlay && <tr><td><Icon icon="play"/></td></tr>}

          {this.renderTableLine(showPath, "Folder", itemPath.dir)}
          {this.renderTableLine(showPath, "Filename", itemPath.filename)}

          {this.renderTableLine(showAll, "xxxx", "xxxx")}

        </tbody></table>
      </div>
    );
  }

}

// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
  detailsState: state.slideshow.detailsState,
  detailsPosition: state.slideshow.detailsPosition,
  showIndex: state.slideshow.showIndex,
  items: state.slideshow.items,
  autoPlay: state.slideshow.autoPlay,
});


export default connect( mapStateToProps )(DetailsOverlay);
