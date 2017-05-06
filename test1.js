var canvas; // canvas element
var gl; // webgl element
var shaderProgram;  // shader element
var AnimationID; // used to record the scene
var TimeoutID;
var bridge=[]; // array of bridges
var msg=[]; // array of message stack for each bridge
var lan=[]; // array of 
var cnt = 0; // counter to log out information
var timeout_value = 3000; // timeout interval

// temp_initBuffers
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
// temp_matrix
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

// initObjects
function initObjects(){
  // initialize five bridges with properties
  // root, cost, id, root_port_id, root_port_bridge, neighbor_port_id, neighbor_port_state, neighbor_bridge
  bridge[1] = new br_create(1, 0, 1, 1, 1, [1,2], ["N/A","N/A"], [2,3,4]); // bridge1
  bridge[2] = new br_create(2, 0, 2, 2, 2, [5,6], ["N/A","N/A"], [1,3,5]); // bridge2
  bridge[3] = new br_create(3, 0, 3, 3, 3, [9,10,11], ["N/A","N/A","N/A"], [1,2,3,4]); // bridge3
  bridge[4] = new br_create(4, 0, 4, 4, 4, [3,4], ["N/A","N/A"], [1,3,5]); // bridge4
  bridge[5] = new br_create(5, 0, 5, 5, 5, [7,8], ["N/A","N/A"], [2,3,4]); // bridge5

  // initialize four LANs
  // dport, min_cost, dbridge, neighbor_port_id, neighbor_bridge_id
  lan[1] = new lan_create(undefined, 999, 0, [1, 5], [1, 2]);
  lan[2] = new lan_create(undefined, 999, 0, [2, 3, 10], [1, 4, 3]);
  lan[3] = new lan_create(undefined, 999, 0, [6, 7, 11], [2, 5, 3]);
  lan[4] = new lan_create(undefined, 999, 0, [4, 8, 9], [4, 5, 3]);
  // init messages, msg[start port][receiver port]
  for(var i=0;i<12;i++){
    msg[i]=[];
    for(var j=0;j<12;j++){
      msg[i][j] = new msg_create(undefined, undefined, undefined, undefined, undefined);
    }
  }
  // define initial messages with BPDUs stored in bridges
  // define coming port for messages
  // root, cost, sender, dest
  msg[1][5].comingport = 5; // bridge1 to bridge2
  msg[1][5].root = 1;
  msg[1][5].cost = 0;
  msg[1][5].sender = 1;
  msg[1][5].dest = 2;
  msg[2][10].comingport = 10; // bridge1 to bridge3
  msg[2][10].root = 1;
  msg[2][10].cost = 0;
  msg[2][10].sender = 1;
  msg[2][10].dest = 3;
  msg[2][3].comingport = 3; // bridge1 to bridge4
  msg[2][3].root = 1;
  msg[2][3].cost = 0;
  msg[2][3].sender = 1;
  msg[2][3].dest = 4;
  msg[5][1].comingport = 1; // bridge2 to bridge1
  msg[5][1].root = 2;
  msg[5][1].cost = 0;
  msg[5][1].sender = 2;
  msg[5][1].dest = 1;
  msg[6][11].comingport = 11; // bridge2 to bridge3
  msg[6][11].root = 2;
  msg[6][11].cost = 0;
  msg[6][11].sender = 2;
  msg[6][11].dest = 3;
  msg[6][7].comingport = 7; // bridge2 to bridge5
  msg[6][7].root = 2;
  msg[6][7].cost = 0;
  msg[6][7].sender = 2;
  msg[6][7].dest = 5;
  msg[10][2].comingport = 2; // bridge3 to bridge1
  msg[10][2].root = 3;
  msg[10][2].cost = 0;
  msg[10][2].sender = 3;
  msg[10][2].dest = 1;
  msg[11][6].comingport = 6; // bridge3 to bridge2
  msg[11][6].root = 3;
  msg[11][6].cost = 0;
  msg[11][6].sender = 3;
  msg[11][6].dest = 2;
  msg[10][3].comingport = 3; // bridge3 to bridge4 path1
  msg[10][3].root = 3;
  msg[10][3].cost = 0;
  msg[10][3].sender = 3;
  msg[10][3].dest = 4;
  msg[9][4].comingport = 4; // bridge3 to bridge4 path2
  msg[9][4].root = 3;
  msg[9][4].cost = 0;
  msg[9][4].sender = 3;
  msg[9][4].dest = 4;
  msg[11][7].comingport = 7; // bridge3 to bridge5 path1
  msg[11][7].root = 3;
  msg[11][7].cost = 0;
  msg[11][7].sender = 3;
  msg[11][7].dest = 5;
  msg[9][8].comingport = 8; // bridge3 to bridge5 path2
  msg[9][8].root = 3;
  msg[9][8].cost = 0;
  msg[9][8].sender = 3;
  msg[9][8].dest = 5;
  msg[3][2].comingport = 2; // bridge4 to bridge1
  msg[3][2].root = 4;
  msg[3][2].cost = 0;
  msg[3][2].sender = 4;
  msg[3][2].dest = 1;
  msg[3][10].comingport = 10; // bridge4 to bridge3 path1
  msg[3][10].root = 4;
  msg[3][10].cost = 0;
  msg[3][10].sender = 4;
  msg[3][10].dest = 3;
  msg[4][9].comingport = 9; // bridge4 to bridge3 path2
  msg[4][9].root = 4;
  msg[4][9].cost = 0;
  msg[4][9].sender = 4;
  msg[4][9].dest = 3;
  msg[4][8].comingport = 8; // bridge4 to bridge5
  msg[4][8].root = 4;
  msg[4][8].cost = 0;
  msg[4][8].sender = 4;
  msg[4][8].dest = 5;
  msg[7][6].comingport = 6; // bridge5 to bridge2
  msg[7][6].root = 5;
  msg[7][6].cost = 0;
  msg[7][6].sender = 5;
  msg[7][6].dest = 2;
  msg[7][11].comingport = 11; // bridge5 to bridge3 path1
  msg[7][11].root = 5;
  msg[7][11].cost = 0;
  msg[7][11].sender = 5;
  msg[7][11].dest = 3;
  msg[8][9].comingport = 9; // bridge5 to bridge3 path2
  msg[8][9].root = 5;
  msg[8][9].cost = 0;
  msg[8][9].sender = 5;
  msg[8][9].dest = 3;
  msg[8][4].comingport = 4; // bridge5 to bridge4
  msg[8][4].root = 5;
  msg[8][4].cost = 0;
  msg[8][4].sender = 5;
  msg[8][4].dest = 4;

  // log out the initial state of all bridges and LANs
  console.log("------------------------------------------");
  console.log("Bridge state at start.");
  for (var i=1;i<=5;i++){
    console.log("bridge["+i+"]"+" root="+bridge[i].root);
    console.log("bridge["+i+"]"+" cost="+bridge[i].cost); 
    console.log("bridge["+i+"]"+" root_port_id="+bridge[i].rootportid);
    console.log("bridge["+i+"]"+" neighbor_link_id=    "+bridge[i].neiportid);
    console.log("bridge["+i+"]"+" neighbor_link_state="+bridge[i].neiportstate);

  }
  console.log("LAN state at start.");
  for (var i=1;i<=4;i++){
    console.log("lan["+i+"]"+" designated_port="+lan[i].dport);
  }
}

// initWebGL
function initWebGL(canvas){
  gl = null;
  try{
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');;
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  }
  catch(e) {
  }
  if (!gl){
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

// initBuffers
function initBuffers(){
  triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    var trianglevertices = [
      0.0,  1.0,  0.0,
      -1.0, -1.0,  0.0,
      1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglevertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    var squarevertices = [
      1.0,  1.0,  0.0,
      -1.0,  1.0,  0.0,
      1.0, -1.0,  0.0,
      -1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squarevertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}

// getShader
function getShader(gl, id){
  var shaderScript = document.getElementById(id);
  if (!shaderScript){
    return null;
  }
  var str = "";
  var currentChild = shaderScript.firstChild;
  while(currentChild){
    if(currentChild.nodeType == 3){
      str += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
  var shader;
  if (shaderScript.type == "x-shader/x-fragment"){
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type = "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
  gl.shaderSource(shader, str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));    
      return null;
  }
  return shader;
}

// initShaders
function initShaders(){
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: ");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

// drawScene
function drawScene(){
  // simulate the spanning tree
  // update and send the msg to neighbor bridges
  for (var i=1;i<=5;i++){ // loop through all the bridges
    for (var j=0;j<bridge[i].neiportid.length;j++){ // loop through all the neighbor port
      var k = bridge[i].neiportid[j]; // neighbor port id = k
      for (var l=1;l<=11;l++){ // loop through all the msg for sending
        if (msg[k][l].sender === i){
          // update the msg
          msg[k][l].root = bridge[i].root;
          msg[k][l].cost = bridge[i].cost;
        }
      }
    }
  }
  // update bridge BPDU based on message received
  for (var i=1;i<=5;i++){ // loop through all the bridges
    for (var j=0;j<bridge[i].neiportid.length;j++){ // loop through all the neighbor port
      var k = bridge[i].neiportid[j]; // neighbor port id = k
      for (var l=1;l<=11;l++){ // loop through all the msg for receiving
        if (msg[l][k].dest === i){
          // update bridge BPDU with received messages
          bpdu_update(l,k,i);
        }
      }
    }
  }
  // update LAN state to find designated bridge
  for (var i=1;i<=4;i++){
    lan_update(i);
  }

  // loging the current state of bridges 
  cnt++;
  if (cnt<10){
    console.log("------------------------------------------");
    console.log("Bridge state after " + cnt + " frames.");
    for (var i=1;i<=5;i++){
      console.log("bridge["+i+"]"+" root="+bridge[i].root);
      console.log("bridge["+i+"]"+" cost="+bridge[i].cost);
      console.log("bridge["+i+"]"+" root_port_id="+bridge[i].rootportid);
      console.log("bridge["+i+"]"+" neighbor_link_id=    "+bridge[i].neiportid);
      console.log("bridge["+i+"]"+" neighbor_link_state="+bridge[i].neiportstate);
    }
    console.log("LAN state after " + cnt + " frames.");
    for (var i=1;i<=4;i++){
      console.log("lan["+i+"]"+" designated_bridge="+lan[i].dbridge);
      console.log("lan["+i+"]"+" designated_port="+lan[i].dport);
    }
  }

  // draw the scene
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.identity(mvMatrix);
  
  mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

  //mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [3.0, 0.0, -7.0]);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

  AnimationID = requestAnimationFrame(drawScene);
  //TimeoutID = setTimeout(drawScene, timeout_value);
}

// button1_event
function button1_event(){
  var element = document.getElementById("div2");
  element.innerHTML = "Changed by button1_event";
}

// button2_event
function button2_event(){
  window.location.href = "index_test.html";
}

/***** Matrix utility functions *****/
function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

// constructor for bridges
function br_create(root, cost, id, rootportid, rootportbridge, neiportid, neiportstate, neibridge){
  this.root = root;
  this.cost = cost;
  this.id = id;
  this.rootportid = rootportid;
  this.rootportbridge = rootportbridge;
  this.neiportid = neiportid;
  this.neiportstate = neiportstate;
  this.neibridge = neibridge;
}
// constructor for messages
function msg_create(root, cost, sender, dest, comingport){
  this.root = root;
  this.cost = cost;
  this.sender = sender;
  this.dest = dest;
  this.comingport = comingport;
}
// constructor for LANs
function lan_create(dport, min_cost, dbridge, neiportid, neibridge){
  // sequence of neibridge should follow the sequence of neiportid
  this.dport = dport;
  this.min_cost = min_cost;
  this.dbridge = dbridge;
  this.neiportid = neiportid;
  this.neibridge = neibridge;
}

// function to update the BPDUs for all bridges
function bpdu_update(l, k, i){
  // M1 = msg[l][k], M2 = bridge[i]'s BPDU
  //  console.log("test log for " + i);
  //  console.log(msg[l][k]);
  //  console.log(bridge[i]);
  if (msg[l][k].root < bridge[i].root){
    // M1 better than M2
    bridge[i].root = msg[l][k].root;
    bridge[i].cost = msg[l][k].cost + 1;
    // set this coming_port to be rootport
    for (var idx=0;idx<bridge[i].neiportid.length;idx++){
      if (bridge[i].neiportid[idx] == k){ // find this coming port id in bridge[i]'s neighbor port id list
        if(bridge[i].rootportbridge > msg[l][k].sender){
          bridge[i].rootportbridge = msg[l][k].sender;
          bridge[i].rootportid = k;
          for (var idx2=0;idx2<bridge[i].neiportid.length;idx2++){ // change the other rootport to blocked
            if (bridge[i].neiportstate[idx2] == "rootport"){
              bridge[i].neiportstate[idx2] = "N/A";
            }
          }
          bridge[i].neiportstate[idx] = "rootport";
        }
      }
    }
  }else if((msg[l][k].root == bridge[i].root) && (msg[l][k].cost < bridge[i].cost)){
    // M1 better than M2
    bridge[i].cost = msg[l][k].cost + 1;
    // set this coming_port to be rootport
    for (var idx=0;idx<bridge[i].neiportid.length;idx++){
      if (bridge[i].neiportid[idx] == k){ // find this coming port id in bridge[i]'s neighbor port id list
        //bridge[i].neiportstate[idx] = "rootport";
        if(bridge[i].rootportbridge > msg[l][k].sender){
          bridge[i].rootportbridge = msg[l][k].sender;
          bridge[i].rootportid = k;
          for (var idx2=0;idx2<bridge[i].neiportid.length;idx2++){ // change the other rootport to blocked
            if (bridge[i].neiportstate[idx2] == "rootport"){
              bridge[i].neiportstate[idx2] = "N/A";
            }
          }
          bridge[i].neiportstate[idx] = "rootport";
        }
      }
    }
  }else if((msg[l][k].root == bridge[i].root) && (msg[l][k].cost == bridge[i].cost) && (msg[l][k].sender < bridge[i].id)){
    // M1 better than M2
    // set this coming_port to be rootport
    for (var idx=0;idx<bridge[i].neiportid.length;idx++){
      if (bridge[i].neiportid[idx] == k){ // find this coming port id in bridge[i]'s neighbor port id list
        //bridge[i].neiportstate[idx] = "rootport";
        if(bridge[i].rootportbridge > msg[l][k].sender){
          bridge[i].rootportbridge = msg[l][k].sender;
          bridge[i].rootportid = k;
          for (var idx2=0;idx2<bridge[i].neiportid.length;idx2++){ // change the other rootport to blocked
            if (bridge[i].neiportstate[idx2] == "rootport"){
              bridge[i].neiportstate[idx2] = "N/A";
            }
          }
          bridge[i].neiportstate[idx] = "rootport";
        }
      }
    }
  }else{// M2 better than M1
    // no change
  }
}
// lan update function
function lan_update(i){
  var k = 0;
  for (var idx=0;idx<lan[i].neibridge.length;idx++){
    // loop through all the neighbor bridge of lan[i]
    k = lan[i].neibridge[idx]; // neighbor bridge id
    if (bridge[k].cost < lan[i].min_cost){
      lan[i].min_cost = bridge[k].cost;
      lan[i].dbridge = k;
      lan[i].dport = lan[i].neiportid[idx];
    }else if ((bridge[k].cost == lan[i].min_cost) && (k < lan[i].dbridge)){
      lan[i].dbridge = k;
      lan[i].dport = lan[i].neiportid[idx];
    }
  }
}


/******** application start *********/
function test_start(){
  canvas = document.getElementById("test_canvas");
  initWebGL(canvas); // Initialize the WebGL content
  if (gl){ // test if WebGL is available and working
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  } 
  initShaders();
  initBuffers();
  initObjects();

  AnimationID = window.requestAnimationFrame(drawScene);
  //TimeoutID = setTimeout(drawScene, timeout_value);
}

