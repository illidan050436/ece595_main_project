var canvas; // canvas element
var ctx;  // canvas context
var b=[]; // array of Bridges
var l=[]; // array of LANs
var line=[]; // array of links
var startTime = undefined;
var msg = []; // array of msg
var AnimationId; // used to stop and resume animation
var statetime;
var wholesystemstate = "unstable";
var li1, li2, li3;
var speed = 10;
var started = 0;
var stopped = 1;

// scenario3 button, bridge4 failed
function button1_event(){
  window.cancelAnimationFrame(AnimationId);
  //li2.innerHTML = "Link6 info being discard from bridge3 and LAN3";
  ctx.strokeStyle = '#7FFF00';
  ctx.strokeRect(675,400,225,50);
  ctx.font = "20px Aerial";
  ctx.fillStyle = '#000000';
  ctx.fillText("Failed, either side down", 690, 425);
  for (var i = 0;i<5;i++)
    for (var j = 0;j<5;j++){
     msg[i][j]["preH"] = msg[i][j]["curH"];
       msg[i][j]["preW"] = msg[i][j]["curW"];
  }
  line[2]["state"] = "failed";
  line[3]["state"] = "failed";
  stopped = 1;
}
// scenario1 button, link6 failed
function button2_event(){
  window.cancelAnimationFrame(AnimationId);
  //li2.innerHTML = "Link6 info being discard from bridge3 and LAN3";
  ctx.strokeStyle = '#7FFF00';
  ctx.strokeRect(675,400,225,50);
  ctx.font = "20px Aerial";
  ctx.fillStyle = '#000000';
  ctx.fillText("Failed, either side down", 690, 425);
  for (var i = 0;i<5;i++)
    for (var j = 0;j<5;j++){
     msg[i][j]["preH"] = msg[i][j]["curH"];
       msg[i][j]["preW"] = msg[i][j]["curW"];
  }
  if (line[5].state === "dbridge" && line[6].state === "rootport"){
    line[6]["state"] = "dbridge";
    line[7]["state"] = "rootport";
  }
  line[5]["state"] = "failed";
  stopped = 1;
}

// scenario2 button, link7 failed
function button3_event(){ 
  window.cancelAnimationFrame(AnimationId);
  //li2.innerHTML = "Link11's info being discard from bridge3 and LAN3";
  ctx.strokeStyle = '#7FFF00';
  ctx.strokeRect(675,400,225,50);
  ctx.font = "20px Aerial";
  ctx.fillStyle = '#000000';
  ctx.fillText("Failed", 690, 425);
  for (var i = 0;i<5;i++)
    for (var j = 0;j<5;j++){
     msg[i][j]["preH"] = msg[i][j]["curH"];
       msg[i][j]["preW"] = msg[i][j]["curW"];
  }
  line[6]["state"] = "failed";
  stopped = 1;
}
// resume button
function button4_event(){
  for (var i = 0;i<5;i++)
   for (var j = 0;j<5;j++){
    msg[i][j]["start"] = Date.now();
  }
  AnimationId=window.requestAnimationFrame(drawScene);
}
// start button
function button5_event(){
  if (started == 0){
    for (var i = 0;i<5;i++)
      for (var j = 0;j<5;j++){
      msg[i][j]["start"] = Date.now();
    }
    AnimationId=window.requestAnimationFrame(drawScene);
    started = 1;
  }else{
    for (var i = 0;i<5;i++)
      for (var j = 0;j<5;j++){
      msg[i][j]["start"] = Date.now();
    }
    window.location.reload();
  }
  stopped = 0;
}
// pause button
function button6_event(){
  window.cancelAnimationFrame(AnimationId);
  for (var i = 0;i<5;i++)
    for (var j = 0;j<5;j++){
      msg[i][j]["preH"] = msg[i][j]["curH"];
      msg[i][j]["preW"] = msg[i][j]["curW"];
  }
  stopped = 1;
}

// button7_event, speed up
function button7_event(){
  if (stopped == 1){
    speed = max(speed / 2, 7);
    statetime = Date.now();
  }
}
// button8_event, speed down
function button8_event(){
  if (stopped ==1){
    speed = speed * 2;
    statetime = Date.now();
  }
}

/*********************
*   Canvas Drawing   *
*********************/

//drawScene
function drawScene(){
    ctx.clearRect(0, 0, 1200, 800); 
    for (var i =0;i<4;i++){
       drawLAN(l[i],i);
    }
    for (var i =0;i<5;i++){
       drawBridge(b[i],i);
    }
    for (var i =0;i<11;i++){
       drawline(line[i]);
    }
  //sendMsg to all pairs
  var i,j;
  for (i = 0;i<5;i++){
    for (j = 0;j<b[i].neighbourbridge.length;j++){
        var k = b[i].neighbourbridge[j];
        if (msg[i][k].curstate == "end"){
          updateMsg(i,k);        
          if (wholesystemstate == "stable"){
            updatelink(i,k);
          }
        }
        sendMsg(i,k);
      }
  }
  //bridge table
  drawTable();
  AnimationId=window.requestAnimationFrame(drawScene);
}

//update msg
function updateMsg(i,j){
  var tmplane;
  var tmplink1;
  var tmplink2;
  var flag = false;
  //find 2 links and lane
  for (var k = 0; k < b[i].neighbourlink.length;k++){
    for (var m = 0; m < b[j].neighbourlink.length;m++)
       if (b[i].neighbourlink[k].lan.Id === b[j].neighbourlink[m].lan.Id){
           tmplink1 = b[i].neighbourlink[k];
           tmplink2 = b[j].neighbourlink[m];
           tmplane =  b[i].neighbourlink[k].lan;
       }
  }

  if ( msg[i][j].root < b[j].root ){
    b[j].root = msg[i][j].root;
    b[j].cost = msg[i][j].cost + 1;   
  }else if (msg[i][j].root === b[j].root && (msg[i][j].cost+1) < b[j].cost){
    b[j].cost = msg[i][j].cost + 1;
  }
  // link failure changes
  if (tmplink2.state == "failed" || tmplink1.state == "failed"){
    b[j]["lowestid"] = undefined;
  }else if (b[j].lowestid == undefined || b[j].lowestid > (i+1)){
    b[j]["lowestid"] = i+1;
  }
  for (var k = 0;k<b[j].neighbourbridge.length;k++){
    var d = b[j].neighbourbridge[k];
    msg[j][d].cost = b[j].cost;
    msg[j][d].root = b[j].root;
  }
  msg[i][j]["preW"] = b[i].textW;
  msg[i][j]["preH"] = b[i].textH;
  msg[i][j]["curW"] = b[i].textW;
  msg[i][j]["curH"] = b[i].textH;
  if (wholesystemstate === "stable" && (tmplink2.state === undefined || tmplink1.state === undefined)){
    msg[i][j]["curstate"] = "end";
  }else if (tmplink2.state == "failed" || tmplink1.state == "failed"){ // link failure changes
    msg[i][j]["curstate"] = "end";
  }else{
    msg[i][j]["curstate"] = "line";
  } 
  msg[i][j]["start"] = Date.now();
}
// update link
function updatelink(i,j){
  var tmplane;
  var tmplink1;
  var tmplink2;
  var flag = false;
  //find 2 links and lane
  for (var k = 0; k < b[i].neighbourlink.length;k++){
    for (var m = 0; m < b[j].neighbourlink.length;m++)
       if (b[i].neighbourlink[k].lan.Id === b[j].neighbourlink[m].lan.Id){
           tmplink1 = b[i].neighbourlink[k];
           tmplink2 = b[j].neighbourlink[m];
           tmplane =  b[i].neighbourlink[k].lan;
       }
  }
  //root_port
  if ((msg[i][j].cost+1) == b[j].cost && b[i].Id == b[j].lowestid){
    tmplink2["state"] = "rootport";
    b[j]["rootport"] = tmplink2.Id;
  }
  if (msg[i][j].cost == 0){
    tmplink1["state"] = "rootport";
    b[i]["rootport"] = tmplink1.Id;
  }
  //designated bridge
  for (var k = 0;k < 4;k++){
    var id = l[k].neighbourlink[0].bridge.Id;
    var min_cost = l[k].neighbourlink[0].bridge.cost;
    var cur_line = l[k].neighbourlink[0];

    for (var m = 1;m < l[k].neighbourlink.length;m++){
       if (min_cost > l[k].neighbourlink[m].bridge.cost){
           min_cost = l[k].neighbourlink[m].bridge.cost;
           id = l[k].neighbourlink[m].bridge.Id;
           cur_line = l[k].neighbourlink[m];
       }else if (min_cost == l[k].neighbourlink[m].bridge.cost && l[k].neighbourlink[m].bridge.Id < id){
           id = l[k].neighbourlink[m].bridge.Id;
           cur_line = l[k].neighbourlink[m];
       }
    }
    if (cur_line.state === undefined){
      cur_line["state"] = "dbridge";
    }
  }
}

// draw bridge table
function drawTable(){
  var flag = true;
  for (var i = 0;i<5;i++){
    // bridge state table
    ctx.strokeStyle = '#7FFF00';
    ctx.strokeRect(0,50*i,130,50);
    ctx.font = "20px Aerial";
    ctx.fillStyle = '#000000';
    ctx.fillText("Bridge"+(i+1)+":"+b[i].root+"|"+b[i].cost+"|"+b[i].Id,0,45*(i+1));
    if (b[i].root != b[i].preroot ){
      flag =false;
      b[i]["preroot"] = b[i].root;
    }
    if (b[i].cost != b[i].precost ){
      flag =false;
      b[i]["precost"] = b[i].cost;
    }
  }
  if (flag == false){
    statetime = Date.now();
    wholesystemstate = "unstable";
  }
  if (Date.now()-statetime > 714*speed ){
    wholesystemstate = "stable";
  }

  ctx.strokeStyle = '#7FFF00';
  ctx.strokeRect(0,250,130,50);
  ctx.font = "20px Aerial";
  ctx.fillStyle = '#000000';
  ctx.fillText("state:"+ wholesystemstate,0,45*6);
  ctx.strokeStyle = '#7FFF00';
  ctx.strokeRect(0,750,1500,50);
  ctx.font = "20px Aerial";
  ctx.fillStyle = '#000000';
  for (var i = 0;i < line.length;i++){
    ctx.fillText((i+1)+":"+line[i].state,0+i*105,775);
  }
}
// sendMsg
function sendMsg(i,j,time){
  if (time === undefined)
    time = Date.now();
  var shift = ((time - msg[i][j].start)/speed);
  var tmplane;
  var tmplink1;
  var tmplink2;
  var tmplane_sign;
  var tmplane_dir;
  var tmplink1_sign;
  var tmplink1_dir;
  var tmplink2_sign;
  var tmplink2_dir;
  //find 2 links and lane
  for (var k = 0; k < b[i].neighbourlink.length;k++){
    for (var m = 0; m < b[j].neighbourlink.length;m++)
       if (b[i].neighbourlink[k].lan.Id === b[j].neighbourlink[m].lan.Id){
           tmplink1 = b[i].neighbourlink[k];
           tmplink2 = b[j].neighbourlink[m];
           tmplane =  b[i].neighbourlink[k].lan;
       }
  }
  //find move left or right on vertical or horizon
  if (tmplink1.posW === tmplink1.toW){
    tmplink1_dir = "vertical";
    if (tmplink1.posH === (tmplane.posH + tmplane.Height)){
      tmplink1_sign = -1;
    }
    else{
      tmplink1_sign = 1;
    }
  }else{
    tmplink1_dir = "horizon";
    if (tmplink1.posW === (tmplane.posW + tmplane.Width)){
      tmplink1_sign = -1;
    }
    else{
      tmplink1_sign = 1;
    }
  }

  if (tmplink2.posW === tmplink2.toW){
    tmplink2_dir = "vertical";
    if (tmplink2.posH === (tmplane.posH + tmplane.Height)){
      tmplink2_sign = 1;
    }
    else{
      tmplink2_sign = -1;
    }
  }else{
    tmplink2_dir = "horizon";
    if (tmplink2.posW === (tmplane.posW + tmplane.Width)){
      tmplink2_sign = 1;
    }
    else{
      tmplink2_sign = -1;
    }
  }

  if (b[i].posW > b[j].posW){
     tmplane_sign = -1;
  }else{
     tmplane_sign = 1;
  }
 
  //move along link,lane,link
  switch (msg[i][j].curstate){
    case "line":
      if (tmplink1_dir === "vertical"){
        if ( Math.abs (msg[i][j].curH - tmplink1.posH) > 2 ){
          msg[i][j]["curH"] =  msg[i][j].preH + shift * tmplink1_sign;
        }else{
          msg[i][j]["curstate"] = "lan";
          msg[i][j]["start"] = time;
          msg[i][j]["preH"] = msg[i][j]["curH"];
        }
      }else{
        if ( Math.abs (msg[i][j].curW - tmplink1.posW) > 2){
          msg[i][j]["curW"] =  msg[i][j].preW + shift * tmplink1_sign;
        }else{
          msg[i][j]["curstate"] = "lan";
          msg[i][j]["start"] = time;
          msg[i][j]["preW"] = msg[i][j]["curW"];
        }
      }
      break;
    case "lan":
        if ( Math.abs(msg[i][j].curW - tmplink2.posW) > 2 ){
          msg[i][j]["curW"] =  msg[i][j].preW + shift * tmplane_sign;
        }else{
          msg[i][j]["start"] = time;
          msg[i][j]["curstate"] = "line2"
          msg[i][j]["preW"] = msg[i][j]["curW"];
        }
      break;
    case "line2":
      if (tmplink2_dir === "vertical"){
        if ( Math.abs (msg[i][j].curH - b[j].textH) > 2){
          msg[i][j]["curH"] = msg[i][j].preH + shift * tmplink2_sign;
        }else{
          msg[i][j]["start"] = time;
          msg[i][j]["curstate"] = "end";
        }
      }else{
        if ( Math.abs (msg[i][j].curW - b[j].textW) > 2){
          msg[i][j]["curW"] = msg[i][j].preW + shift * tmplink2_sign;
        }else{
          msg[i][j]["start"] = time;
          msg[i][j]["curstate"] = "end";
        }
      }
      break;
    default:
      break;
  }  
  if (msg[i][j].curstate != "end"){
    ctx.strokeStyle = '#00FFFF';
    ctx.strokeRect(msg[i][j].curW, msg[i][j].curH, 65, 30);
    ctx.font = "20px Aerial";
    ctx.fillStyle = '#000000';
    ctx.fillText(msg[i][j].root+"|"+msg[i][j].cost+"|"+(i+1),msg[i][j].curW, msg[i][j].curH+20);   
  }
}
// drawLAN
function drawLAN(lan,num){
  ctx.strokeStyle = '#FF0000';
  ctx.strokeRect(lan.posW,lan.posH,lan.Width, lan.Height);
  ctx.font = "20px Aerial";
  ctx.fillStyle = '#000000';
  ctx.fillText("LAN"+(num+1), lan.textW, lan.textH);
}
// drawBridge
function drawBridge(bridge,num){
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(bridge.posW,bridge.posH,bridge.Width, bridge.Height );
  ctx.font = "20px Aerial";
  ctx.fillStyle = '#000000';
  ctx.fillText("B"+(num+1), bridge.textW, bridge.textH);
}
// drawLink
function drawline(link){
  if (wholesystemstate == "stable" && link.state === undefined){
    // not draw line
  }else if (link.state == "failed"){
    // link failure changes
  }else{
    if (link.posW == link.toW){
      ctx.font = "20px Aerial";
      ctx.fillStyle = '#000000';
      ctx.fillText(link.Id, link.posW,(link.posH+link.toH)/2);
    }else{
      ctx.font = "20px Aerial";
      ctx.fillStyle = '#000000';
      ctx.fillText(link.Id, (link.posW+link.toW)/2,link.posH);
    }
    ctx.beginPath();
    ctx.moveTo(link.posW, link.posH);
    ctx.lineTo(link.toW, link.toH);
    ctx.stroke(); 
    ctx.closePath();
  }
}
// initialization
function init(){
  //LAN1 to B1
  line1={state:undefined,Id:1,posW:275,posH:140,toW:275,toH:220,bridge:undefined,lan:undefined};
  // LAN2 to B1
  line2={state:undefined,Id:2,posW:275,posH:400,toW:275,toH:320,bridge:undefined,lan:undefined};
  // LAN2 to B4
  line3={state:undefined,Id:3,posW:275,posH:440,toW:275,toH:500,bridge:undefined,lan:undefined};
  // LAN4 to B4
  line4={state:undefined,Id:4,posW:275,posH:660,toW:275,toH:600,bridge:undefined,lan:undefined};
  // LAN1 to B2
  line5={state:undefined,Id:5,posW:975,posH:140,toW:975,toH:220,bridge:undefined,lan:undefined};
  // LAN3 to B2
  line6={state:undefined,Id:6,posW:975,posH:400,toW:975,toH:320,bridge:undefined,lan:undefined};
  // LAN3 to B5
  line7={state:undefined,Id:7,posW:975,posH:440,toW:975,toH:500,bridge:undefined,lan:undefined};
   // LAN4 to B5
  line8={state:undefined,Id:8,posW:975,posH:660,toW:975,toH:600,bridge:undefined,lan:undefined};
  // LAN4 to B3
  line9={state:undefined,Id:9,posW:600,posH:660,toW:600,toH:480,bridge:undefined,lan:undefined};
  // LAN2 to B3
  line10={state:undefined,Id:10,posW:325,posH:420,toW:550,toH:420,bridge:undefined,lan:undefined};
   // LAN3 to B3
  line11={state:undefined,Id:11,posW:925,posH:420,toW:650,toH:420,bridge:undefined,lan:undefined};
  // four LANs
  l1={Id:1,posW:225,posH:100,Width:800,Height:40,textW:575,textH:125,neighbourlink:[line1,line5]};
  l2={Id:2,posW:225,posH:400,Width:100,Height:40,textW:250,textH:425,neighbourlink:[line2,line3,line10]};
  l3={Id:3,posW:925,posH:400,Width:100,Height:40,textW:950,textH:425,neighbourlink:[line6,line7,line11]};
  l4={Id:4,posW:225,posH:660,Width:800,Height:40,textW:575,textH:685,neighbourlink:[line8,line9]};
  l.push(l1);
  l.push(l2);
  l.push(l3);
  l.push(l4);
  b1={lowestid:undefined,dport:undefined,rootport:undefined,Id:1,preroot:1,precost:0,root:1,cost:0,posW:225,posH:220,Width:100,Height:100,textW:265,textH:270,neighbourlink:[line1,line2],neighbourbridge:[1,2,3]};
  b2={lowestid:undefined,dport:undefined,rootport:undefined,Id:2,preroot:2,precost:0,root:2,cost:0,posW:925,posH:220,Width:100,Height:100,textW:965,textH:270,neighbourlink:[line5,line6],neighbourbridge:[0,2,4]};
  b3={lowestid:undefined,dport:undefined,rootport:undefined,Id:3,preroot:3,precost:0,root:3,cost:0,posW:550,posH:380,Width:100,Height:100,textW:585,textH:430,neighbourlink:[line9,line10,line11],neighbourbridge:[0,1,3,4]};
  b4={lowestid:undefined,dport:undefined,rootport:undefined,Id:4,preroot:4,precost:0,root:4,cost:0,posW:225,posH:500,Width:100,Height:100,textW:265,textH:550,neighbourlink:[line3,line4],neighbourbridge:[0,2,4]};
  b5={lowestid:undefined,dport:undefined,rootport:undefined,Id:5,preroot:5,precost:0,root:5,cost:0,posW:925,posH:500,Width:100,Height:100,textW:965,textH:550,neighbourlink:[line7,line8],neighbourbridge:[1,2,3]};
  b.push(b1);
  b.push(b2);
  b.push(b3);
  b.push(b4);
  b.push(b5);

  line1["bridge"] = b1;
  line1["lan"] = l1;
  line2["bridge"] = b1;
  line2["lan"] = l2;
  line3["bridge"] = b4;
  line3["lan"] = l2;
  line4["bridge"] = b4;
  line4["lan"] = l4;
  line5["bridge"] = b2;
  line5["lan"] = l1;
  line6["bridge"] = b2;
  line6["lan"] = l3;
  line7["bridge"] = b5;
  line7["lan"] = l3;
  line8["bridge"]  = b5;
  line8["lan"] = l4;
  line9["bridge"]  = b3;
  line9["lan"] = l4;
  line10["bridge"]  = b3;
  line10["lan"] = l2;
  line11["bridge"]  = b3;
  line11["lan"] = l3;
  
  line.push(line1);
  line.push(line2);
  line.push(line3);
  line.push(line4);
  line.push(line5);
  line.push(line6);
  line.push(line7);
  line.push(line8);
  line.push(line9);
  line.push(line10);
  line.push(line11);
  
  //2d msg send from i to j
  for (var i = 0;i<5;i++){
    msg[i] = [];
    for (var j = 0; j < 5;j++)
      msg[i][j] = {root:undefined,cost:undefined,start: undefined,preW:undefined,preH:undefined,curW:undefined,curH:undefined,curstate:undefined};
  }
    
  for (var i = 0;i<5;i++)
    for (var j = 0;j<5;j++){
      msg[i][j]["root"] = b[i].root;
      msg[i][j]["cost"] = b[i].cost;
      msg[i][j]["preW"] = b[i].textW;
      msg[i][j]["preH"] = b[i].textH;
      msg[i][j]["curW"] = b[i].textW;
      msg[i][j]["curH"] = b[i].textH;
      msg[i][j]["curstate"] = "line";
      msg[i][j]["start"] = Date.now();
    }
  statetime = Date.now(); 
}
// start
function test_start(){
  canvas = document.getElementById("test_canvas");
  // draw static figures on the canvas first
  ctx = canvas.getContext("2d");
  li1 = document.getElementById("li1");
  li2 = document.getElementById("li2");
  li3 = document.getElementById("li3");
  // initialization
  init();
  //AnimationId=window.requestAnimationFrame(drawScene);
}
