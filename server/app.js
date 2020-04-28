var app = require('http').createServer();
var io = require('socket.io')(app);
var PORT = 8081;
/*define user*/
var users = [];

app.listen(PORT);
/*
	*function中的socket为每个客户端单独连接的socket实例，只通知当前连接用户
	*io.sockets 通知所有连接用户
	*socket.broadcast 给除了自己以外的客户端广播消息
*/
io.on('connection', function (socket) {
	/*new user or not*/
	var isNewPerson = true;
	/*current user*/
    var username = null;
	/*listen*/
	socket.on('login',function(data){
		for(var i=0;i<users.length;i++){
	        if(users[i].username === data.username){
	          	isNewPerson = false;
	          	break;
	        }else{
	          	isNewPerson = true;
	        }
	    }
	    if(isNewPerson){
	        username = data.username;
	        users.push({
	          username:data.username
	        })



	        let resdata = {
	        	//username: data.username,	/*sender uer name*/
	        	msgType: 0, 	/*msg type：0 from system，1 from cliant*/
	        	msgDate:  new Date(), 	/*server time*/
	        	message:  data.username + ' joined the group chat',

	        }

	        /*loginSuccess*/
	        socket.emit('loginSuccess',{username:data.username});

	        /*向所有连接的客户端广播add事件*/
	         io.sockets.emit('receiveMessage',resdata);

	        //io.sockets.emit('add',resdata);
	        console.log('Login Success:',resdata)

	        /*sent to all client side except myself*/
	        // socket.broadcast.emit('add',resdata);

	        /*人数变更，广播给所有连接用户*/
	        console.log('Number of User at the time',users);
	        io.sockets.emit('amountChange',users.length);
	    }else{
	    	/*登录失败*/
	        socket.emit('loginFail','');
	    }
	})

	/*listen sendingmsg*/
	socket.on('sendMessage',function(data){
		let resdata = {
			username: data.username,		/*sender's username*/
			msgType: 1, 			/*msg type：0 from system，1 from cliant*/
			msgDate:  new Date(), 	/*server time*/
			message: data.message,

		}

        io.sockets.emit('receiveMessage',resdata);
        console.log('receiveMessage======:',resdata)
    })

	/*logout*/
	socket.on('disconnect',function(){

		//username  为13行的当前登录用户。也可前端传参进来主动触发
		let resdata = {
        	// username: username,
        	msgType: 0,
        	msgDate:  new Date(),
        	message: username+' left the group chat',

        };
        io.sockets.emit('receiveMessage',resdata);

        console.log('left===',username)


		/*boardcast leave event*/
      	io.sockets.emit('leave',username);
      	users.map(function(val,index){
        if(val.username === username){
          	users.splice(index,1);
        }
        /*user amount change*/
        console.log('Current user',users);
        io.sockets.emit('amountChange',users.length);


      })
    })
})

console.log('app listen at：'+PORT);

