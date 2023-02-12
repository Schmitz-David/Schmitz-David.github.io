let positions, tmp, layerThickness, widthIncrement;
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(2);
  positions=[0];
  initialize();
}
function initialize(){
  for(let i=0;i<positions.length;i++) positions[i]=0;
  positions.push(0);
  layerThickness=height*0.5/positions.length;
  widthIncrement=width*0.1/(positions.length-1);
}
function draw() {
  background(0);
  fill(255);
  for(let d=0.25; d<1;d+=0.25)
    rect(width*(d-0.01),height*0.25,width*0.02, height*0.5);
  tmp=[0,0,0,-1];
  for(let i=positions.length-1;i>=0;i--)
    rect(width*0.25*(0.8+positions[i])-0.5*i*widthIncrement,height*0.75-
    (++tmp[positions[i]])*layerThickness,width*0.1+i*widthIncrement,layerThickness,layerThickness*0.05);
  for(let i=positions.length-1;i>=0&&tmp[3]==-1;i--) if(positions[i]!=2) tmp[3]=i;
  if(tmp[3]==-1) initialize(); else moveToNext(tmp[3],2);
}
function moveToNext(index, goal){
  for(tmp[3]=index-1;positions[index]+goal+positions[tmp[3]]==3;tmp[3]--);
  if(tmp[3]==-1) positions[index]=goal; else moveToNext(tmp[3],3-goal-positions[index]);
}
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  layerThickness=height*0.5/positions.length;
  widthIncrement=width*0.1/(positions.length-1);
}
