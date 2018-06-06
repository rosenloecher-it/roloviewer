import React, { Component } from 'react';
import { connect } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';
import * as cssConstants from '../style/cssConstants';
import DetailPane from './DetailPane';
import ImagePane from './ImagePane';
import ThumbPane from './ThumbPane';
import * as action from "../actions/actionMainPageState";


class MainPage extends Component {

  constructor(props) {
    super(props);

    this.toggleThumbs = this.toggleThumbs.bind(this);
    this.toggleNavi = this.toggleNavi.bind(this);
    this.toggleDetails = this.toggleDetails.bind(this);

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onChangeSizeThumbs = this.onChangeSizeThumbs.bind(this);
    this.onChangeSizeNavi = this.onChangeSizeNavi.bind(this);
    this.onChangeSizeDetails = this.onChangeSizeDetails.bind(this);

    this.temp_state = {
      sizeNaviPane: -1,
      sizeThumbsPane: -1,
      sizeDetailsPane: -1
    };
  }

  toggleThumbs() {
    this.props.dispatch(action.toggleMainPageThumbsPane());
  }
  toggleNavi() {
    this.props.dispatch(action.toggleMainPageNaviPane());
  }
  toggleDetails() {
    this.props.dispatch(action.toggleMainPageDetailsPane());
  }

  onDragEnd() {
    if (this.temp_state.sizeNaviPane > 1)
      this.props.dispatch(action.resizeMainPageNaviPane(this.temp_state.sizeNaviPane));
    if (this.temp_state.sizeThumbsPane > 1)
      this.props.dispatch(action.resizeMainPageThumbsPane(this.temp_state.sizeThumbsPane));
    if (this.temp_state.sizeDetailsPane > 1)
      this.props.dispatch(action.resizeMainPageDetailsPane(this.temp_state.sizeDetailsPane));
  }

  onChangeSizeThumbs(newSize) {
    this.temp_state.sizeThumbsPane = newSize;
  }
  onChangeSizeNavi(newSize) {
    this.temp_state.sizeNaviPane = newSize;
  }
  onChangeSizeDetails(newSize) {
    this.temp_state.sizeDetailsPane = newSize;
  }

  render() {

    const sizeNaviMin = 200;
    const sizeNaviDef = 200;
    const sizeDetailsMin = 200;
    const sizeDetailsDef = 200;
    const sizeThumbsMin = 200;
    const sizeThumbsDef = 200;
    //
    // console.log("render: widthNaviPane / widthThumbsPane / widthDetailsPane = "
    //   , this.props.sizeNaviPane, " / "
    //   , this.props.sizeThumbsPane , " / "
    //   , this.props.sizeDetailsPane);

    //this.props.showNaviPane &&
    //  NaviPane
    //

    return (
      // https://github.com/zesik/react-splitter-layout
      <SplitterLayout
        vertical={true}
        primaryIndex={0}
        primaryMinSize={sizeThumbsMin}
        onSecondaryPaneSizeChange={this.onChangeSizeThumbs}
        onDragEnd={this.onDragEnd}
        secondaryInitialSize={this.props.sizeThumbsPane > 1 ? this.props.sizeThumbsPane : sizeThumbsDef}
        >
        <SplitterLayout
          primaryIndex={1}
          primaryMinSize={sizeNaviMin}
          onSecondaryPaneSizeChange={this.onChangeSizeNavi}
          onDragEnd={this.onDragEnd}
          secondaryInitialSize={this.props.sizeNaviPane > 1 ? this.props.sizeNaviPane : sizeNaviDef}
        >

          <div>
            <button className={cssConstants.CSS_BUTTON}
                    onClick={() => { this.toggleNavi(); }}
            >
              {this.props.showNaviPane && 'Hide navi'}
              {!this.props.showNaviPane && 'Show navi'}
            </button>
            <button className={cssConstants.CSS_BUTTON}
                    onClick={() => { this.toggleThumbs(); }}
            >
              {this.props.showThumbsPane && 'Hide thumbs'}
              {!this.props.showThumbsPane && 'Show thumbs'}
            </button>
            <button className={cssConstants.CSS_BUTTON}
                    onClick={() => { this.toggleDetails(); }}
            >
              {this.props.showDetailsPane && 'Hide details'}
              {!this.props.showDetailsPane && 'Show details'}
            </button>
          </div>
          <SplitterLayout
            primaryIndex={0}
            primaryMinSize={sizeDetailsMin}
            onSecondaryPaneSizeChange={this.onChangeSizeDetails}
            onDragEnd={this.onDragEnd}
            secondaryInitialSize={this.props.sizeDetailsPane > 1 ? this.props.sizeDetailsPane : sizeDetailsDef}
          >
            <ImagePane />

            {this.props.showDetailsPane &&
              <DetailPane />
            }
          </SplitterLayout>
        </SplitterLayout>

        {this.props.showThumbsPane &&
          <ThumbPane />
        }
      </SplitterLayout>
    );
  }
}

const mapStateToProps = state => ({
  showNaviPane: state.mainPageState.showNaviPane,
  showThumbsPane: state.mainPageState.showThumbsPane,
  showDetailsPane: state.mainPageState.showDetailsPane,
  sizeNaviPane: state.mainPageState.sizeNaviPane,
  sizeThumbsPane: state.mainPageState.sizeThumbsPane,
  sizeDetailsPane: state.mainPageState.sizeDetailsPane
});

// function mapStateToProps(state) {
//   return {
//     props: state.reducerMainPageState
//   };
// }

// const mapDispatchToProps = dispatch => {
//   return {
//     onToggleDetailsPane: () => {
//       dispatch(action.toggleMainPageDetailsPane())
//     }
//   }
// }


export default connect( mapStateToProps )(MainPage);



