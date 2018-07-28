import React from 'react';
import {connect} from "react-redux";

// ----------------------------------------------------------------------------------

const _logKey = "crawlerOverlay";

// ----------------------------------------------------------------------------------

class StatusOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.render = this.render.bind(this);
    this.pushTableLine = this.pushTableLine.bind(this);
  }

  // .......................................................

  pushTableLine(tableLines, description, text) {
    if (!text || !description)
      return;

    const key = description;

    tableLines.push( <tr key={key}><td>{description}</td><td>{text}</td></tr> );
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

    this.pushTableLine(tableLines, 'Remaining folders', props.remainingDirs);

    this.pushTableLine(tableLines, 'Crawled folders', props.countDbDirs);
    this.pushTableLine(tableLines, 'Crawled files', props.countDbFiles);

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
  countDbDirs: state.status.countDbDirs,
  countDbFiles: state.status.countDbFiles,
  crawlerInfoPosition: state.slideshow.crawlerInfoPosition,
  crawlerInfoShow: state.slideshow.crawlerInfoShow,
  currentDir: state.status.currentDir,
  currentTask: state.status.currentTask,
  remainingDirs: state.status.remainingDirs,
});


export default connect( mapStateToProps )(StatusOverlay);
