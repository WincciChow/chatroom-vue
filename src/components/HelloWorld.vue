<template>
  <div class="hello">
        <div class="login-wrap" v-if="!isCheckin">
          <div class="login-con">
            <h3>User Login</h3>
            <input type="text" placeholder="Enter Your User Name" id="loginName" v-model.trim="uname" @keyup.13="login">
            <button class="login-btn" @click="login">Log in</button>
          </div>
        </div>

        <div class="chat-wrap " v-else>
          <h1>Group Chat<br><span> ({{amount}} people in room)</span></h1>
          <div class="chat-con clearfix" id="chat_con">
            <template v-for="item in msgList">
              <!-- {{item | json}} -->
              <template v-if="item.msgType==0">
                 <p >{{item.message}}</p><br/>
              </template>

              <template v-else>
                  <div class="chat-item item-right clearfix" v-if="uname == item.username "><span class="img fr"></span><span class="message fr">{{item.message}}</span></div>
                  <div class="chat-item item-left clearfix rela" v-else><span class="abs uname">{{item.username}}  ( {{item.msgDate | formatDate}} )</span><span class="img fl"></span><span class="fl message">{{item.message}}</span></div>
              </template>
            </template>
          </div>
          <div class="bottom">
            <input type="text" id="sendtxt" v-model.trim="inputMsg" @keyup.13="sendMessage">
            <button class="sendBtn" @click="sendMessage">Sent</button>
          </div>
        </div>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      amount: 0,          //Number of people in the chatroom
      uname: 'Wincci',    //default username
      inputMsg: '',
      socket: null,       //define socket
      isCheckin: false,
      msgList:[],         //message list from server
    }
  },
  mounted:function(){
    var vm = this;
    /*set up socket connection*/
    vm.socket = io('ws://localhost:8081');

    vm.socket.on('loginSuccess',function(data){
      if(data.username === vm.uname){
        // vm.checkin(data)
        vm.isCheckin = true;
      }else{
        alert('Wrong username, please try again')
      }
    })

    vm.socket.on('loginFail',function(){
      alert('Name taken')
    })

    //number of users
    vm.socket.on('amountChange',function(data){
      vm.amount = data
    })



    /*receiveMessage*/
    vm.socket.on('receiveMessage',function(data){
      console.log('Receive message from the server：',data)
      vm.msgList.push(data);

      window.scrollTo(0, document.getElementById('chat_con').scrollHeight);

      //console.log('----',document.getElementById('chat_con').scrollHeight)


    })

    // /*new users*/
    // vm.socket.on('add',function(data){
    //   console.log(data)
    //
    // })
    // /*left chat notify*/
    // vm.socket.on('leave',function(name){
    //   console.log('Left===',name)
    //   if(name != null){
    //
    //   }
    // })


  },
  filters:{
    formatDate:function(data){
      var date = data ? new Date(data) : new Date();
      var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
      return time;
    }
  },
  methods:{
    /*login*/
    login:function(){
      var vm = this;

      if(vm.uname){
        /*sent login event to server*/
        vm.socket.emit('login',{username:vm.uname})
      }else{
        alert('Please Enter your name')
      }
    },

    /*send message*/
    sendMessage:function(){
      var vm = this;

      if(vm.inputMsg){
        vm.socket.emit('sendMessage',{username:vm.uname,message:vm.inputMsg});
        vm.inputMsg = '';
      }else{
        alert('Say something……')
      }
    },

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
