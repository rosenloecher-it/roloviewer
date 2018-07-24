import React from 'react';
import {connect} from "react-redux";
import { Icon } from '@blueprintjs/core';
import log from 'electron-log';
import * as constants from "../../common/constants";
import {determinePathAndFilename} from "../../common/utils/transfromPath";

// ----------------------------------------------------------------------------------

const _logKey = "crawlerOverlay";

// ----------------------------------------------------------------------------------

class CrawlerInfoOverlay extends React.Component {

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

    const {props} = this;
    const cssTableClass = "popover-table";
    const cssPositionClass = props.crawlerInfoPosition;

    if (!props.crawlerInfoShow)
      return null; // show nothing

    const tableLines = [];

    this.pushTableLine(tableLines, 'Crawler status', props.currentTask || '?');

    this.pushTableLine(tableLines, 'Current folder', props.currentDir);
    this.pushTableLine(tableLines, 'Remaining folder', props.remainingDirs);

    this.pushTableLine(tableLines, 'Database - count folders', props.countDbDirs);
    this.pushTableLine(tableLines, 'Database - count files', props.countDbFiles);

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
  countDbDirs: state.crawlerProgress.countDbDirs,
  countDbFiles: state.crawlerProgress.countDbFiles,
  currentDir: state.crawlerProgress.currentDir,
  currentTask: state.crawlerProgress.currentTask,
  remainingDirs: state.crawlerProgress.remainingDirs,

  crawlerInfoPosition: state.slideshow.crawlerInfoPosition,
  crawlerInfoShow: state.slideshow.crawlerInfoShow,
});


export default connect( mapStateToProps )(CrawlerInfoOverlay);
