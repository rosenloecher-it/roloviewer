// @flow
import * as React from 'react';
import * as cssConstants from '../style/cssConstants';

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    return (
      <div className={cssConstants.CSS_APP_CONTAINER}>
        {this.props.children}
      </div>
    );
  }
}
