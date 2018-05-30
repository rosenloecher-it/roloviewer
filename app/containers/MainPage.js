import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import * as cssConstants from '../cssConstants';
import DetailPane from './DetailPane';
import NaviPane from './NaviPane';
import ImagePane from './ImagePane';

// export default class MainPage extends Component {
//   render() {
//     return (
//       <div>
//         <h2>Hello world - EditWindow</h2>
//       </div>
//     );
//   }
// }

class MainPage extends Component {
  // constructor(props) {
  //   super(props);
  //
  //   this.state = {
  //     sidebarOpen: true
  //   }
  //
  //   this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
  // }
  //
  // onSetSidebarOpen(open) {
  //   this.setState({sidebarOpen: open});
  // }

  render() {
    return (
      <div id="app" className={cssConstants.CSS_MAIN_CONTAINER}>
        <SplitPane
          split="vertical"
          minSize={150}
          defaultSize={200}
          allowResize="true"
        >
          <NaviPane />

          <SplitPane
            split="vertical"
            minSize={150}
            defaultSize={200}
            allowResize="true"
            primary="second"
          >
            <ImagePane />
            <DetailPane />
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}

export default MainPage;
