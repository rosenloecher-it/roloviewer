import React from 'react';
import {connect} from "react-redux";

// ----------------------------------------------------------------------------------

const _logKey = "crawlerOverlay"; // eslint-disable-line no-unused-vars

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

  fono(val) {
    return ( val === 0 || val ? val : '?' )
  }

  // ......................................................

  render() {

    const {props} = this;
    const cssTableClass = "popover-table";
    const cssPositionClass = props.crawlerInfoPosition;

    if (!props.crawlerInfoShow)
      return null; // show nothing

    const tableLines = [];

    let textDirs, textFiles;
    const countDbDirsAll = this.fono(props.countDbDirsAll);
    const countDbDirsShowable = this.fono(props.countDbDirsShowable);
    const countDbFilesAll = this.fono(props.countDbFilesAll);
    const countDbFilesShowable = this.fono(props.countDbFilesShowable);

    if (countDbDirsShowable !== countDbDirsAll)
      textDirs = `${countDbDirsShowable} of ${countDbDirsAll}`;
    else
      textDirs = `${countDbDirsShowable}`;
    if (countDbFilesShowable !== countDbFilesAll)
      textFiles = `${countDbFilesShowable} of ${countDbFilesAll}`;
    else
      textFiles = `${countDbFilesShowable}`;

    this.pushTableLine(tableLines, 'Crawler status', props.currentTask || '?');
    this.pushTableLine(tableLines, 'Remaining folders', props.remainingDirs);
    this.pushTableLine(tableLines, 'Available folders', textDirs);
    this.pushTableLine(tableLines, 'Available files', textFiles);

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
  }

}

// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
  countDbDirsAll: state.status.countDbDirsAll,
  countDbDirsShowable: state.status.countDbDirsShowable,
  countDbFilesAll: state.status.countDbFilesAll,
  countDbFilesShowable: state.status.countDbFilesShowable,
  crawlerInfoPosition: state.slideshow.crawlerInfoPosition,
  crawlerInfoShow: state.slideshow.crawlerInfoShow,
  currentDir: state.status.currentDir,
  currentTask: state.status.currentTask,
  remainingDirs: state.status.remainingDirs,
});


export default connect( mapStateToProps )(StatusOverlay);
