import React from 'react';
import { connect } from 'react-redux';
import log from 'electron-log';
import * as cssConstants from '../style/cssConstants';
import ImagePane from './imagePane';
import HelpDialog from './helpDialog';
import HelpOverlay from './helpOverlay';
import DetailsOverlay from './detailsOverlay';

// ----------------------------------------------------------------------------------

const _logKey = "slideshow";

// ----------------------------------------------------------------------------------

class Slideshow extends React.Component {

  constructor(props) {
    super(props);

    this.render = this.render.bind(this);
  }

  render() {
    const func = ".render";

    //<HelpDialog />

    const {props} = this;

    //log.debug(`${_logKey}${func} - props.helpShow=`, props.helpShow);

    let helpOverlay = null;
    if (props.helpShow)
        helpOverlay = <HelpOverlay />;
        //helpOverlay = <HelpDialog />;

    //

    return (
      <div className={cssConstants.CSS_MAINPANE}>
        <ImagePane />
        <DetailsOverlay />
        {helpOverlay}

      </div>
    );
  }
}


// ----------------------------------------------------------------------------------

const mapStateToProps = state => ({
  helpShow: state.slideshow.helpShow,
});

export default connect( mapStateToProps )(Slideshow);



