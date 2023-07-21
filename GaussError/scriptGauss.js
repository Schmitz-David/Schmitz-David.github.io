var formula;
var constantNames=
["speed of light in vacuum","Planck constant",
"vacuum magnetic permeability","vacuum electric permittivity",
"Boltzmann constant","gravitational constant","elementary charge","Avogadro constant"];
var constantSymbols=
["c","h","mu","eps","k","G","e","N"];
var constantValues=
[299792458,6.62607015e-34,1.2566370621219e-6,8.854187812813e-12,
1.380649e-23,6.6743015e-11,1.602176634e-19,6.02214076e23];
var constantUnits=
["m/s","J s","N/A^2","F/m","J/K","m^3/(kg s^2)","C","1/mol"];
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
					<input type="number" class="const-value">\
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
document.getElementById("consts-head").insertAdjacentHTML('afterend',
getConstantsString());

function getScientificString(inputNumber, tex=false){
	[prefix, suffix] = inputNumber.toExponential().split('e').map(str => Number(str));
	if(!tex) return prefix.toPrecision(6)+" x 10^"+suffix.toString();
	return prefix.toPrecision(6)+"\\cdot 10^{"+suffix.toString()+"}";
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
