'use strict';

const e = React.createElement;
// var baseUrl = "https://zolushka.unitbean.ru/api/v1/chat/";
var baseUrl = "http://localhost:8081/api/v1/chat/";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      message: "",
      messageError: null,
      messageList : [],

      operatorName: '',
      operatorAvatar: '',

      connectionError: false

    }
    this.handleInput = this.handleInput.bind(this);
    this.update = this.update.bind(this);
    this.getUserId = this.getUserId.bind(this);
    this.send = this.send.bind(this);
  }

  async componentDidMount() {
    await this.getUserId();
    this.update()
  }

  handleInput(e){
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  getUserId(){
    
    if (window.localStorage.getItem('zolushka-chat-id')) {
      this.setState({
        userId: window.localStorage.getItem('zolushka-chat-id')
      });
    }else {
      let id = `${new Date().getTime()}00000000000`;
      window.localStorage.setItem("zolushka-chat-id", id)
      this.setState({
        userId: id
      });
    }
  }
  //обновление списка сообщений
  update(){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${baseUrl}${this.state.userId}/message/list`, false);
    xhr.send();
    if (xhr.status != 200) {
      this.setState({connectionError: true});
    } else {
      console.log("xhr.responseText", JSON.parse(xhr.responseText))
      let response = JSON.parse(xhr.responseText);
      this.setState({
        operatorAvatar: response.result.lastOperatorAvatar,
        operatorName: response.result.lastOperatorFullName,
        messageList: response.result.messageList
      });
    }
  }
  //Отправка сообщений
  async send(e){
    if (e){
      e.preventDefault();
    }
    console.log("send");
    let success = true;
    let state = {messageError: false, connectionError: false}
    if (!this.state.message || this.state.message.length === 0){
      success = false;
      state.messageError = true;
    }
    console.log(this.state.message)
    if (success) {
      
      try{
        let data = {text: this.state.message, photosIds: []}
        console.log(data, data)
        let xhr = new XMLHttpRequest();
        xhr.open('POST', `${baseUrl}${this.state.userId}/message/send`, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        await xhr.send(JSON.stringify(data));
        if (xhr.status != 200)
          state.connectionError = true
        else {
          this.setState({message: ''});
          await this.update()
        }
      }
      catch(e){
        console.log(e)
      }
    }else {
      this.setState(state);
    }

  }

  render() {

    console.log(this.state.messageList)

    return e(
      'div',
      { className:"zolushka-chat-wrapper"},
      e(Bar, null, null),
      e(ChatContainer, {message: this.state.message, messageList: this.state.messageList, onChange: (e) => this.handleInput(e), send: (e)=> this.send(e)}, null),
      e(Footer, null, null)
    );
  }
}

class Bar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return e(
      'div',
      { className: "zolushka-chat-bar" },
      'Чат с оператором'
    );
  }
}

class ChatContainer extends React.Component {
  render(){
    console.log("this.props.messageList" ,this.props.messageList);
    return e(
      'div',
      { className: "zolushka-chat-container"},
      e(Header, {messageList: this.props.messageList}, null),
      e(MessagesWrapper, {messageList: this.props.messageList}, null),
      e(InputBar, {onChange: this.props.onChange, message: this.props.message, send: this.props.send})
    );
  }
}

class Header extends React.Component {
  render(){
    return e(
      'div',
      {className: `zolushka-chat-header row ${!this.props.messageList ? "without-border-buttom" : ""}`},
      e(Avatar, {messageList: this.props.messageList}),
      e(OperatorInfo, {messageList: this.props.messageList})
    );
  }
}

class Avatar extends React.Component {
  render(){
    if (!this.props.messageList)
      return e(
        'div',
        {className: "zolushka-chat-avatar col s2"},
        );

    return e(
      'div',
      {className: "zolushka-chat-avatar col s2"},
      e(
        'img',
        {src: "https://banner2.kisspng.com/20180509/jow/kisspng-call-centre-customer-service-crimewatch-security-s-5af2b2daecbcc4.2197814715258549389697.jpg"}
        )
      );
  }
}

class OperatorInfo extends React.Component {
  render(){
    if (!this.props.messageList)
      return e(
        'div', 
        {className: "zolushka-chat-operator-info"}
        )

    return e(
      'div',
      {className: "zolushka-chat-operator-info"},
      e(
        'div',
        {className: "zolushka-chat-operator-name"},
        "Иванова Юлия"
        ),
      e(
        'div',
        {className: "zolushka-chat-operator-description"},
        "Оператор"
        )
      )
  }
}

class MessagesWrapper extends React.Component {
  
  render(){
    return e(
      'div',
      {className: "zolushka-chat-messages-wrapper"},
      e(MessageUl, {messageList: this.props.messageList}, null)
    )
  }
}

class MessageUl extends React.Component {

  constructor(props){
    super(props);
  }

  render(){
    if (!this.props.messageList)
      return e(
        'div',
        {className: "zolushka-chat-messages-empty"},
        e(
          'img',
          {className: "zolushka-chat-messages-empty-dialog-icon", src: "./accets/shape.svg"}
          ),
        e(
          'div',
          {className: "zolushka-chat-messages-empty-dialog-description"},
          "Сообщения отсутствуют."
          )
        );

    return e(
      'ul',
      {className: "zolushka-chat-messages-list"},
      [this.props.messageList.map((item, idx) => e(MessageItem, {key: idx, message: item}))]
    )
  }
}
class MessageItem extends React.Component {
  constructor(props){
    super(props);
  }
  render(){
    let message = this.props.message;

    return e(
        "div",
        { className: "zolushka-chat-row row" },
        e(
          "div",
          { className: `zolushka-chat-message ${message.authorType === 'OPERATOR' ? "zolushka-chat-from-operator" : "zolushka-chat-from-me"}` },
          e(
            "div",
            { className: "zolushka-chat-message-content" },
            message.text
          ),
          e(
            "div",
            { className: "zolushka-chat-message-date" },
            message.date
          )
        )
      );
  }
}



//Input Row Bar
class InputBar extends React.Component {
  render(){
    return e(
      'div', 
      {className: "zolushka-chat-input-bar row"},
      e(ImagePacks, null),
      e(Input,{message: this.props.message, onChange: this.props.onChange}),
      e(SendButton, {send: this.props.send})
      )
  }
}

class ImagePacks extends React.Component {
  render(){
    return e(
      'div', 
      {className: "zolushka-chat-images-pack col"}
      )
  }
}

class Input extends React.Component {

  constructor(props){
    super(props);
  }

  render(){
    
    return e(
      'input',
      {type: "text", placeholder:"Напишите сообщение", className: "zolushka-chat-input col", value: this.props.message, onChange: this.props.onChange, name: "message"}
      )
  }
}

class SendButton extends React.Component {
  render(){
  
    return e(
      'div',
      {className: "zolushka-chat-send-btn col", onClick: this.props.send},
      e('img', {src: './accets/icSendBlack24PxActive.svg'})
      )
  }
}

//Footer

class Footer extends React.Component {
  render(){
    return e(
      'div',
      {className: "zolushka-chat-footer"},
      e('a', {href: "http://unitbean.ru"}, 
        e('img', {src: "./accets/ubLogo.svg"})
      ));
  }
}

ReactDOM.render(
  React.createElement(App, null, null),
  document.getElementById('zolushka-chat')
);

