var chat = document.getElementById('chat');
   chat.scrollTop = chat.scrollHeight - chat.clientHeight;

var sendbtn=document.getElementById('sendbtn');

const firebaseConfig = {
  apiKey: "AIzaSyB1vL3ByhE8KJ7hYIYcdxb7wBQI_8ARTT8",
  authDomain: "zakoga-f87ec.firebaseapp.com",
  databaseURL: "https://zakoga-f87ec-default-rtdb.firebaseio.com/",
  projectId: "zakoga-f87ec",
  storageBucket: "zakoga-f87ec.appspot.com",
  messagingSenderId: "520243498353",
  appId: "1:520243498353:web:d5406c41ebd71660d8bad0"
};
firebase.initializeApp(firebaseConfig);

var db = firebase.database();
var userId="";
var myuser={
  name:"",
  icon:""
}
if(localStorage.getItem('uid')&&localStorage.getItem('uname')&&localStorage.getItem('uicon')){
  userId=localStorage.getItem('uid');
  myuser.name=localStorage.getItem('uname');
  myuser.icon=localStorage.getItem('uicon');
  $("#signin").hide();
  openchat();
}else{
  signin();
}

function signin() {
  $("#chatwin").hide();
  $("#signin").show();
  $(".setnickname").hide();
  $(".selecticon").show();
  let icon=0;
  let name="";
  let id=getUniqueStr();
  $(".piclist .ipic").on('click', function () {
    icon=$(this).data("no");
    $(".selecticon").fadeOut(300,function(){$(".setnickname").fadeIn(300);});
    $(".setnickname .pic").addClass("i"+icon);
    $(".setnickname button").on('click', function (){
      name=$(".setnickname input").val();
      if(name=="") return;
      $("#signin").fadeOut(500,function(){openchat();});
      userId=id;
      localStorage.setItem('uid', userId);
      myuser={name:name,icon:icon};
      localStorage.setItem('uname', name);
      localStorage.setItem('uicon', icon);

    });
  });

}
var toward="public";
var room="public";
var messagecash={};
function sendmessage(){
  var sendtext=$("#sendtext");
  if(sendtext.val()=="") return;
  let loaddom=$(`<div class="message parker">
    <div class="typing typing-1"></div>
    <div class="typing typing-2"></div>
    <div class="typing typing-3"></div>
  </div>`).appendTo("#chat");
  var now = new Date();
  let message=sendtext.val();
    db.ref(room).push({
        user:userId,
        to:toward,
        message: message,
        date: firebase.database.ServerValue.TIMESTAMP
    },function(e){
      if (e == null) {
            //成功時の処理
            loaddom.remove();
        } else {
            //失敗時の処理
            loaddom.remove();
            alert("😢インターネットに接続されていません");
        }
    });
    sendtext.val("");
}
function opendm(touserId) {
  toward=touserId;

}
function openchat(){
  registuser();
$("#chatwin").fadeIn();
makedmlist();
let now = new Date();
//全員チャットのメッセージを受け取る
db.ref('dm').orderByChild("user").equalTo(userId).on("child_added", function(data) {
    const v = data.val();
    let n=messagecash[v.to];
    n.push(v);
    messagecash[v.to]=n;
    if(toward!=v.to) {
       return;
     };
    const k = data.key;
    let str = "";
    if(v.user==userId){
    str += '<div class="message parker">'+v.message+'</div>';
    }else{
    str += '<div class="message stark">'+v.message+'</div>';
    }
    $("#chat").append($(str));
    chat.scrollTop = chat.scrollHeight;
});
db.ref("dm").orderByChild("to").equalTo(userId).limitToLast(30).on("child_added", function(data) {
    const v = data.val();
    let n=messagecash[v.user];
    n.push(v);
    messagecash[v.user]=n;
    if(toward!=v.user) {
       return;
     };
    const k = data.key;
    let str = "";
    if(v.user==userId){
    str += '<div class="message parker">'+v.message+'</div>';
    }else{
    str += '<div class="message stark">'+v.message+'</div>';
    }
    $("#chat").append($(str));
    chat.scrollTop = chat.scrollHeight;
});
db.ref("public").orderByChild("date").limitToLast(30).on("child_added", function(data) {
const v = data.val();
  let n=messagecash["public"];
  n.push(v);
  messagecash["public"]=n;
  if(toward!="public"){return;}
    const k = data.key;
    let str = "";
    if(v.user==userId){
    str += '<div class="message parker">'+v.message+'</div>';
    }else{
    str += '<div class="message stark">'+v.message+'</div>';
    }
    $("#chat").append($(str));
    chat.scrollTop = chat.scrollHeight;
});
}
function makedmlist() {
  db.ref("users").once('value').then((snapshot) => {
    const ob=snapshot.val();
    let users = Object.keys(ob).map(function (key) {return ob[key];});
    let keys=Object.keys(ob);
    messagecash['public']=[];
    for (var i = 0; i < users.length; i++) {
      if(keys[i]==userId) continue;
      messagecash[keys[i]]=[];
      let str = `<div class="contact" onclick="openchatroom('`+users[i].name+`','`+users[i].icon+`','`+keys[i]+`')">
        <div class="pic i`+users[i].icon+`"></div>
        <div class="name">
          `+ users[i].name +`
        </div>
        <div class="message">
          I like this one
        </div>
      </div>`;
      $("#chatwin .contacts").append($(str));
    }
});
}
function openpublicchat() {
  toward="public";
  room="public";
   $(".chat").html(`<div id="chatvar" class="contact bar">
     <div class="pic public"></div>
     <div class="name">全員
     </div>
     <div class="seen">
誰でも喋ることができる自由なスペース
     </div>
   </div>
   <div class="messages" id="chat">
     <div class="time">
       読み込めるのは接続前30までです
     </div>
   </div>
   <div class="input">
     <i class="fas fa-camera"></i><i class="far fa-laugh-beam"></i><input id="sendtext" placeholder="Type your message here!" type="text" /><i onclick="sendmessage()" id="sendbtn" class="fas fa-paper-plane"></i>
   </div>
 </div>`);
 let messagelist=messagecash["public"];
   for (var i = 0; i < messagelist.length; i++) {
     const m=messagelist[i];
     let str="";
     if(m.user==userId){
     str += '<div class="message parker">'+m.message+'</div>';
     }else{
     str += '<div class="message stark">'+m.message+'</div>';
     }
     $("#chat").append($(str));
   }
   chat.scrollTop = chat.scrollHeight;
}
function openchatroom(roomname,roomicon,roomid) {
 toward=roomid;
 room="dm";
  $(".chat").html(`<div id="chatvar" class="contact bar">
    <div class="pic i`+ roomicon +`"></div>
    <div class="name">
      `+ roomname +`
    </div>
    <div class="seen">

    </div>
  </div>
  <div class="messages" id="chat">
    <div class="time">
      読み込めるのは接続前30までです
    </div>
  </div>
  <div class="input">
    <i class="fas fa-camera"></i><i class="far fa-laugh-beam"></i><input id="sendtext" placeholder="Type your message here!" type="text" /><i onclick="sendmessage()" id="sendbtn" class="fas fa-paper-plane"></i>
  </div>
</div>`);
let messagelist=messagecash[roomid];
  for (var i = 0; i < messagelist.length; i++) {
    const m=messagelist[i];
    let str="";
    if(m.user==userId){
    str += '<div class="message parker">'+m.message+'</div>';
    }else{
    str += '<div class="message stark">'+m.message+'</div>';
    }
    $("#chat").append($(str));
  }
  chat.scrollTop = chat.scrollHeight;
}

function registuser() {
  db.ref("users/"+userId).update({
      name:myuser.name,
      icon: myuser.icon,
      date: firebase.database.ServerValue.TIMESTAMP
  },function(e){
    if (e == null) {
          //成功時の処理
      } else {
          //失敗時の処理
          alert("😢インターネットに接続されていません");
      }
  })
}
//ランダムなIDを作成
function getUniqueStr(myStrong){
 var strong = 1000;
 if (myStrong) strong = myStrong;
 return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
}