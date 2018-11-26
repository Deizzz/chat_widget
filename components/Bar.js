'use strict';
const e = React.createElement;

export default class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    return e(
      'div',
      { onClick: () => this.setState({ liked: true }), className: "zolushka-chat-bar" },
      'Чат с оператором'
    );
  }
}
