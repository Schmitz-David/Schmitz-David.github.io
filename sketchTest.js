let s;
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
	s="";
}

function draw() {
	background(255);
	text(s,10,10,110,110);
	rect(5,5,110,110);
}
function keyPressed(){
	if(keyCode==CODED){
		if(keyCode=BACKSPACE){
			if(s.length>0) s=s.substring(0,s.length-1);
		} else s+=key;
	}
}

