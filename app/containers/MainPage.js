import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import * as cssConstants from '../cssConstants';

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
          className="pt-fill"
        >
          <div>
            <button className={cssConstants.CSS_BUTTON}>Button</button>
          </div>

          <SplitPane
            split="vertical"
            minSize={150}
            defaultSize={200}
            allowResize="true"
            primary="second"
          >
            <div>Main content</div>
            <div>
              <button className={cssConstants.CSS_BUTTON}>Button</button>
            </div>
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}

export default MainPage;
