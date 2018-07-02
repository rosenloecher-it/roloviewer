import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as cssConstants from '../style/cssConstants';
import ImagePane from './imagePane';
import HelpDialog from './helpDialog';

class Slideshow extends Component {

  constructor(props) {
    super(props);

  }

  render() {

    return (
      <div className={cssConstants.CSS_MAINPANE}>
        <HelpDialog />
        <ImagePane />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  // showNaviPane: state.mainPageState.showNaviPane,
  // showThumbsPane: state.mainPageState.showThumbsPane,
  // showDetailsPane: state.mainPageState.showDetailsPane,
  // sizeNaviPane: state.mainPageState.sizeNaviPane,
  // sizeThumbsPane: state.mainPageState.sizeThumbsPane,
  // sizeDetailsPane: state.mainPageState.sizeDetailsPane
});

export default connect( mapStateToProps )(Slideshow);



