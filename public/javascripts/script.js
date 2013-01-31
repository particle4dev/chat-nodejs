$(document).ready(function() {
	/**
	* scroll chat message container
	*/
	
	
	$('.jspContainer').slimScroll({
		position: 'right',
		height: '360px',
		railVisible: true,
		alwaysVisible: false
	});	
	
	$('div.chatUsersContent').slimScroll({
		position: 'right',
		width: '152px',
		height: '360px',
		railVisible: true,
		alwaysVisible: false
	});	
      

	var loginSubmit = $('input[type=button]#blueButtonLogin');
	var sendSubmit  = $('input[type=button]#blueButtonSend');
	/**
	* LOGIN
	*/	
	loginSubmit.click( function() {
		chater.login();
	}).prop('disabled', true).css({"opacity": "0.35" ,"filter": "Alpha(Opacity=0.35)"});

	var checkLoginSubmit = function (){ 
		if($("input#name").val()){
			loginSubmit.prop('disabled', false).css({"opacity": "1" ,"filter": "Alpha(Opacity=1)"});
		}
		else{ 
			loginSubmit.prop('disabled', true).css({"opacity": "0.35" ,"filter": "Alpha(Opacity=0.35)"});
		}	
	}
	$("input, select, textarea, option, button").live('hover',checkLoginSubmit).live('change',function(){
		checkLoginSubmit();
	}).live("keypress", function(e) {
                /* ENTER PRESSED*/
                if (e.keyCode == 13) {
                    if($('#loginForm').css('display') != 'none'){ 
			  chater.login();
		    }
		    else if($('#submitForm').css('display') != 'none'){
			  chater.addMessage();
		    }
                    return false;
                }
        });;
	

	/**
	* LOGOUT
	*/
	$('a.logoutButton').click( function() {
		chater.logout();			
	});

	/**
	* SEND MESSAGE
	*/
	$('input[type="button"]#blueButtonSend').click( function() {
		chater.addMessage();
	});

	/**
	* ADD USER
	*/
	$('p.count').click( function() {
		
	
	});


	/**
	* START
	*/
	
	chater.init();

})

var chater = {
	data          : {
        	id         : -1,
		images     : '',
		name       : '',
		connection : null
	},
	init          : function(){
		chater.data.connection = io.connect('http://localhost',"8000");
		chater.data.connection.on('connect', function(){});
		// or socket.connect();
		chater.data.connection.on('message', function(data) {
			var obj = (data);
			if(obj.type === 'loading'){	
				for(i=0; i<obj.listChater.length; i++) {
					chater.addChater(obj.listChater[i].user,obj.listChater[i].images);
				}
				$('span#number').html(parseInt($('span#number').html())+obj.listChater.length);
				for(i=0; i<obj.historyMessage.length; i++) {
					//effect
					$("div.jspPane").prepend('<div class="chat chat-322584 rounded">'+
						'<span class="gravatar">'+
							'<img src="'+obj.historyMessage[i].images+'" width="23" height="23"'+ 					'onload="this.style.visibility=\'visible\'" style="visibility: visible; ">'+
						'</span>'+
						'<span class="author">'+obj.historyMessage[i].user+':</span>'+
						'<span class="text">'+obj.historyMessage[i].message+'</span>'+
						'<span class="time">'+obj.historyMessage[i].time+'</span>'+
						"</div>"		
					);
					
				}
			}
  			if(obj.type === 'addChater'){				
				var info = $('#loginInformation');
				info.find('span span.name').text(obj.user);
				info.find('span img').attr('src',obj.images);
				chater.data.name    = obj.user;
				chater.data.images  = obj.images;
				//effect
				$('form#loginForm').slideUp(500,function(){});
				$('form#submitForm').slideDown(500);
				$('div#headerChat').slideUp(500,function(){});	
				$('div#loginInformation').slideDown(500,function(){});
				chater.addChater(obj.user,obj.images);
				$('span#number').html(parseInt($('span#number').html())+1);
			}
			if(obj.type === 'newChater'){
				//add new person online
				chater.addChater(obj.user,obj.images);
				$('span#number').html(parseInt($('span#number').html())+1);
			}
			if(obj.type === 'removeChater'){
				//remove
				chater.removeChater(obj.user);
				$('span#number').html(parseInt($('span#number').html())-1);
			}
			if(obj.type === 'logout'){
				
				chater.removeChater(obj.user);
				$('span#number').html(parseInt($('span#number').html())-1);
				//effect
				$('form#submitForm').slideUp(500);
				$('form#loginForm').slideDown(500,function(){});
				$('div#loginInformation').slideUp(500,function(){});	
				$('div#headerChat').slideDown(500,function(){});
			}
			if(obj.type === 'addMessage'){
				//effect
				$("div.jspPane").prepend('<div class="chat chat-322584 rounded">'+
					'<span class="gravatar">'+
						'<img src="'+obj.data.images+'" width="23" height="23"'+ 					'onload="this.style.visibility=\'visible\'" style="visibility: visible; ">'+
					'</span>'+
					'<span class="author">'+obj.data.user+':</span>'+
					'<span class="text">'+obj.data.message+'</span>'+
					'<span class="time">'+obj.data.time+'</span>'+
					"</div>"		
				);
				
			
			}
			$('span.text').emoticonize({
			//delay: 800,
			//animate: false,
			//exclude: 'pre, code, .no-emoticons'
			});
		});
		
	},
	login         : function(){

		chater.data.connection.send(JSON.stringify({
  			type   : "login",
  			user   : $('input#name').val(),
			images : $('input#images').val()
		}));

		
	},
	logout        : function(){
		chater.data.connection.send(JSON.stringify({
  			type   : "logout"
		}));	
		
	},
	addChater     : function(name, images){
		//effect
		$('div.chatUsersContent').prepend(
			'<div title="'+name+'" id="user'+name+'" class="user">'+
				'<img src="'+images+'" width="30" height="30" onload="this.style.visibility=\'visible\'" style="visibility: visible; ">'+
			'</div>');
	},
	removeChater  : function($id){
		
		//effect
		$('div#user'+$id).remove();
	},
	addMessage    : function(){
		chater.data.connection.send(JSON.stringify({
  			type    : "addMessage",
  			user    : $('input#name').val(),
			images  : $('input#images').val(),
			message : $('input[name="chatText"]#chatText').val()
		}));
		$('input[name="chatText"]#chatText').val('');
	},
	removeMessage : function($id){}
}
