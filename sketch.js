let a;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  stroke(255);
  a = height / 2;
}

function draw() {
  if(mouseIsPressed) background(51);
	else background(101);
  line(0, a, width, a);
  a = a - 0.5;
  if (a < 0) {
    a = height;
  }
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	a=height;
}
function deviceTurned(){
	windowResized();
}
