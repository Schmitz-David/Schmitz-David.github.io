var formula;
var constantNames=
["speed of light in vacuum","Planck constant",
"vacuum magnetic permeability","vacuum electric permittivity",
"Boltzmann constant","gravitational constant","elementary charge","Avogadro constant",
"reduced Planck constant","characteristic impedance of vacuum",
"Coulomb constant","cosmological constant","Stefan-Boltzmann constant",
"Planck length","Planck mass","Planck time","Planck temperature",
"nuclear magneton","Bohr magneton","magnetic flux quantum","conductance quantum",
"electron mass","proton mass","neutron mass","atomic mass constant","molar gas constant",
"earth mass","solar mass","standard acceleration of free fall"];
var constantSymbols=
["c","h","mu","eps","k","G","e","N","hb","Z","ke","L","s","lp","mp","tp",
"Tp","numag","muB","magflux","GG","mE","mP","mN","mU","R","ME","MS","g"];
var constantValues=
[299792458,6.62607015e-34,1.2566370621219e-6,8.854187812813e-12,
1.380649e-23,6.6743015e-11,1.602176634e-19,6.02214076e23,1.054571817e-34,
376.73031366857,8.987551792314e9,1.089e-52,5.670374419e-8,1.616255e-35,
2.176434e-8,5.391247e-44,1.416784e32,5.0507837461e-27,9.2740100783e-24,
2.067833848e-15,7.748091729e-5,9.1093837015e-31,1.67262192369e-27,
1.67492749804e-27,1.66053906660e-27,8.31446261815324,5.9722e24,1.98847e30,
9.80665];
var constantUnits=
["m/s","J s","N/A^2","F/m","J/K","m^3/(kg s^2)","C","1/mol","J s","&#x3A9;",
"N m^2 / C^2","1/m^2","W/(m^2 K^4)","m","kg","s","K","J/T","J/T","Wb","S",
"kg","kg","kg","kg","J/(mol K)","kg","kg","m/s^2"];
var isConstantSelected=[];
const varsTable = document.getElementById("vars-table");
const constsTable = document.getElementById("consts-table");
var warningMsg = "";
for(let i=0; i<constantSymbols.length; i++) isConstantSelected.push(false);

document.getElementById("add-row-vars-btn").addEventListener("click",function(){
	document.getElementById("vars-table").insertAdjacentHTML('beforeend',
	'\
			<tr>\
				<th>\
					<input type="text" class="var-name">\
				</th>\
				<th>\
					<input type="text" class="var-value">\
				</th>\
				<th>\
					<input type="text" class="var-uncertainty">\
				</th>\
				<th>\
					<input type="text" pattern="[A-Za-z]+" class="var-unit">\
				</th>\
				<th>\
							<button class="cancel-button-vars">\
								<svg width="10" height="10">\
									<line x1="0" y1="0" x2="10" y2="10" stroke="black"/>\
									<line x1="0" y1="10" x2="10" y2="0" stroke="black"/>\
									X\
								  </svg>\
							</button>\
						</th>\
			</tr>\
			');
			const ar = document.querySelectorAll(".cancel-button-vars");
		var last = ar[ar.length-1];
		last.addEventListener("click",function(){
			varsTable.removeChild(last.parentElement.parentElement.parentElement);
		});
});

document.getElementById("add-row-consts-btn-custom").addEventListener("click",function(){
	document.getElementById("consts-table").insertAdjacentHTML('beforeend',
		'\
			<tr class="const-row">\
				<th></th>\
				<th>\
					<input type="text" class="const-name">\
				</th>\
				<th>\
					<input type="text" class="const-value">\
				</th>\
				<th>\
					<input type="text" pattern="[A-Za-z]+" class="const-unit">\
				</th>\
				<th>\
							<button class="cancel-button-consts" >\
								<svg width="10" height="10">\
									<line x1="0" y1="0" x2="10" y2="10" stroke="black"/>\
									<line x1="0" y1="10" x2="10" y2="0" stroke="black"/>\
									X\
								  </svg>\
							</button>\
						</th>\
			</tr>\
		');
		const ar = document.querySelectorAll(".cancel-button-consts");
		var last = ar[ar.length-1];
		last.addEventListener("click",function(){
			constsTable.removeChild(last.parentElement.parentElement.parentElement);
		});
});
/* if all predefined constants should be printed immediately*/
/*document.getElementById("consts-head").insertAdjacentHTML('afterend',
getConstantsString());*/

function getScientificString(inputNumber, tex=false){
	[prefix, suffix] = inputNumber.toExponential().split('e').map(str => Number(str));
	if(!tex) return prefix.toPrecision(6)+" x 10^"+suffix.toString();
	return prefix.toPrecision(6)+"\\cdot 10^{"+suffix.toString()+"}";
}
function getScientificStringMathJax(inputNumber, tex=false){
	[prefix, suffix] = inputNumber.toExponential().split('e').map(str => Number(str));
	return "$$"+prefix.toPrecision(6)+"\\cdot 10^{"+suffix.toString()+"}$$";
}

function getConstantsString(){
	result="";
	for(let i=0; i<constantSymbols.length; i++){
		result+="<tr>";
		result+="<th>"+constantNames[i]+"</th>";
		result+="<th>"+constantSymbols[i]+"</th>";
		result+="<th>"+getScientificString(constantValues[i])+"</th>";
		result+="<th>"+constantUnits[i]+"</th>";
		result+="<th><input type=\"checkbox\" onchange=\"isConstantSelected["+i+"]=!isConstantSelected["+i+"];\"></th>";
		result+="</tr>";
	}
	return result;
}

var actualVarNames=[], actualConstNames=[], actualVarValues=[], actualConstValues=[];
var actualVarUncertainties=[], actualVarUnits=[], actualConstUnits=[];
var partialDerivatives=[];
var errorText = 0, partialText = 0;
var actualGoalName;
var finalUncertainty;
var uncertaintyText = 0;

document.getElementById("calculation").addEventListener("click",function(){
	const works = evaluate();
	if(!works){
		if(errorText==0){
			errorText = 1;
			document.getElementById("main").insertAdjacentHTML('beforeend','<p style="color: red" id=\"error-text\">WRONG INPUT!</p>');
		}
	} else{
		if(errorText == 1) document.getElementById("main").removeChild(document.getElementById("error-text"));
		errorText = 0;
	}
});

function evaluate(){
	finalUncertainty = 0;
	if(partialText == 1){
		partialText = 0;
		document.getElementById("main").removeChild(document.getElementById("partials-text"));
	}
	if(uncertaintyText ==1){
		uncertaintyText = 0;
		document.getElementById("main").removeChild(document.getElementById("uncertainty-text"));
	}

	actualVarNames = document.querySelectorAll(".var-name");
	actualVarValues = document.querySelectorAll(".var-value");
	actualVarUncertainties = document.querySelectorAll(".var-uncertainty");
	actualVarUnits = document.querySelectorAll(".var-unit");

	actualConstNames = document.querySelectorAll(".const-name");
	actualConstValues = document.querySelectorAll(".const-value");
	actualConstUnits = document.querySelectorAll(".const-unit");
	actualGoalName = document.getElementById("goal").value;

	formula = math.parse(document.getElementById("formula").value);

	
	/*
	if(actualGoalName == "") return false;*/
	/*for(let i=0; i<actualVarNames.length; i++){
		if(actualVarNames[i]==""||actualVarValues[i]==""||actualVarUncertainties[i]==""||actualVarUnits=="") return false;
	}
	for(let i=0; i<actualConstNames.length; i++){
		if(actualConstNames[i]==""||actualConstValues[i]==""||actualConstUnits=="") return false;
	}*/
	partialDerivatives = [];
	for(let i=0; i<actualVarNames.length; i++){
		partialDerivatives.push(math.derivative(formula,math.parse(actualVarNames[i].value)));
	}

	document.getElementById("main").insertAdjacentHTML('beforeend','\
	<div id="partials-text"><h2>Computation of partial derivatives</h2>\
	'+getStringOfPartials(partialDerivatives)+'\
	</div>');

	document.getElementById("main").insertAdjacentHTML('beforeend','\
	<div id="uncertainty-text"><h2>Final uncertainty</h2>\
	$$\\Delta '+actualGoalName+'='+getScientificString(getFinalUncertainty(partialDerivatives),true)+'$$\
	</div>');

	if(document.getElementById("warningMsg")!=null) document.getElementById("main").removeChild(document.getElementById("warningMsg"));
	if(warningMsg!="") document.getElementById("partials-text").insertAdjacentHTML('beforeBegin','\
	<div id="warningMsg"><p style="color:red">'+warningMsg+'</p></div>');
	warningMsg="";

	MathJax.typeset();

	return true;
}
function getStringOfPartials(partials){
	var result="";
	for(let i=0; i<partials.length; i++){
		result+="$$\\frac{\\partial "+actualGoalName+"}{\\partial "+actualVarNames[i].value+"}="+partials[i].toTex()+"$$";
	}
	partialText = 1;
	return result;
}
document.getElementById("formula").addEventListener("change",renderFormula);
document.getElementById("goal").addEventListener("change",renderFormula);
function renderFormula(){
	document.getElementById("formulaTex").innerHTML = "$$"+document.getElementById("goal").value+"="+math.parse(document.getElementById("formula").value).toTex()+"$$";
	MathJax.typeset();
}
function getFinalUncertainty(partials){
	var result = 0;
	const dictionary = getDictionary();
	for(let i=0; i<partials.length; i++){
		result += math.pow(actualVarUncertainties[i].value*math.evaluate(partials[i].toString(),dictionary),2);
	}
	uncertaintyText=1;
	return math.sqrt(result);
}
function getDictionary(){
	var dict = {};
	warningMsg="";
	for(let i=0; i<constantNames.length; i++){
		if(isConstantSelected[i]){
			dict[constantSymbols[i]]=constantValues[i];
		}
	}
	for(let i=0; i<actualVarNames.length;i++){
		if(warningMsg=="" && dict[actualVarNames[i].value]!=null) warningMsg="Duplicate symbol: "+actualVarNames[i].value;
		dict[actualVarNames[i].value] = actualVarValues[i].value;
	}
	for( let i=0; i<actualConstNames.length;i++){
		if(warningMsg=="" && dict[actualConstNames[i].value]!=null) warningMsg="Duplicate symbol: "+actualConstNames[i].value;
		dict[actualConstNames[i].value] = actualConstValues[i].value;9
	}
	return dict;
}


/*
	autocomplete for constants
*/
autocomplete(document.getElementById("add-natural-const-input"),constantNames);

function autocomplete(input, arr) {
	/*the autocomplete function takes two arguments,
	the text field element and an array of possible autocompleted values:*/
	var currentFocus;
	/*execute a function when someone writes in the text field:*/
	input.addEventListener("input", function(e) {
		var a, b, i, val = this.value;
		/*close any already open lists of autocompleted values*/
		closeAllLists();
		if (!val) { return false;}
		currentFocus = -1;
		/*create a DIV element that will contain the items (values):*/
		a = document.createElement("DIV");
		a.setAttribute("id", this.id + "autocomplete-list");
		a.setAttribute("class", "autocomplete-items");
		/*append the DIV element as a child of the autocomplete container:*/
		this.parentNode.appendChild(a);
		/*for each item in the array...*/
		var alreadyAdded = 0;
		for (i = 0; i < arr.length && alreadyAdded<3; i++) {
		  /*check if the item starts with the same letters as the text field value:*/
		  if(arr[i].toLowerCase().search(val.toLowerCase())>-1){
		  /*if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {*/
			/*create a DIV element for each matching element:*/
			alreadyAdded++;
			b = document.createElement("DIV");
			/*make the matching letters bold:*/
			tmpIndex = arr[i].toLowerCase().search(val.toLowerCase());
			b.innerHTML = arr[i].substr(0,tmpIndex)+"<strong>"+arr[i].substr(tmpIndex,val.length)+"</strong>"+arr[i].substr(tmpIndex+val.length);
			/*insert a input field that will hold the current array item's value:*/
			b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
			let iClosure=i;
			/*execute a function when someone clicks on the item value (DIV element):*/
				b.addEventListener("click", function(e) {
				/*insert the value for the autocomplete text field:*/
				input.value = this.getElementsByTagName("input")[0].value;
				/*close the list of autocompleted values,
				(or any other open lists of autocompleted values:*/
				closeAllLists();

				/*add the constant to the list*/
				if(!isConstantSelected[iClosure]){
					document.getElementById("consts-head").insertAdjacentHTML('afterEnd','\
					<tr id="const-index-'+iClosure.toString()
					+'"><th>'+constantNames[iClosure]+'</th><th>'+constantSymbols[iClosure]+'</th><th>'+getScientificStringMathJax(constantValues[iClosure])+
					'</th><th>'+constantUnits[iClosure]+'</th>'+
					'<th>\
								<button class="cancel-button-consts" onClick="removeConstant('+iClosure+')">\
									<svg width="10" height="10">\
										<line x1="0" y1="0" x2="10" y2="10" stroke="black"/>\
										<line x1="0" y1="10" x2="10" y2="0" stroke="black"/>\
										X\
									  </svg>\
								</button>\
					</th>'
					+'</tr>');
					MathJax.typeset();
				}
				isConstantSelected[iClosure]=true;
			});
			a.appendChild(b);
		  }
		}
	});

	input.addEventListener("keydown", function(e) {
		var x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (e.keyCode == 40) {
		  /*If the arrow DOWN key is pressed,
		  increase the currentFocus variable:*/
		  currentFocus++;
		  /*and and make the current item more visible:*/
		  addActive(x);
		} else if (e.keyCode == 38) { //up
		  /*If the arrow UP key is pressed,
		  decrease the currentFocus variable:*/
		  currentFocus--;
		  /*and and make the current item more visible:*/
		  addActive(x);
		} else if (e.keyCode == 13) {
		  /*If the ENTER key is pressed, prevent the form from being submitted,*/
		  e.preventDefault();
		  if (currentFocus > -1) {
			/*and simulate a click on the "active" item:*/
			if (x) x[currentFocus].click();
		  }
		}
	});
	function addActive(x) {
	  if (!x) return false;
	  removeActive(x);
	  if (currentFocus >= x.length) currentFocus = 0;
	  if (currentFocus < 0) currentFocus = (x.length - 1);
	  x[currentFocus].classList.add("autocomplete-active");
	}
	function removeActive(x) {
	  for (var i = 0; i < x.length; i++) {
		x[i].classList.remove("autocomplete-active");
	  }
	}
	function closeAllLists(elmnt) {
	  /*close all autocomplete lists in the document,
	  except the one passed as an argument:*/
	  var x = document.getElementsByClassName("autocomplete-items");
	  for (var i = 0; i < x.length; i++) {
		if (elmnt != x[i] && elmnt != input) {
		x[i].parentNode.removeChild(x[i]);
	  }
	}
  }
  document.addEventListener("click", function (e) {
	  closeAllLists(e.target);
  });
}

function removeConstant(arrayIndex){
	isConstantSelected[arrayIndex]=false;
	toRemove = document.getElementById("const-index-"+arrayIndex.toString());
	toRemove.parentNode.removeChild(toRemove);
}
