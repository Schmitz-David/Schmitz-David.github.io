var formula;
var naturalConstants=["c","G","e_0"];
var constantValues=[299792458,1,1];
var constantUnits=["m/s","N","N"];
var isConstantSelected=[];
const varsTable = document.getElementById("vars-table");
const constsTable = document.getElementById("consts-table");
for(let i=0; i<naturalConstants.length; i++) isConstantSelected.push(false);

document.getElementById("add-row-vars-btn").addEventListener("click",function(){
	document.getElementById("vars-table").insertAdjacentHTML('beforeend',
	'\
			<tr>\
				<th>\
					<input type="text" class="var-name">\
				</th>\
				<th>\
					<input type="number" class="var-value">\
				</th>\
				<th>\
					<input type="number" class="var-uncertainty">\
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

function getConstantsString(){
	result="";
	for(let i=0; i<naturalConstants.length; i++){
		result+="<tr>";
		result+="<th>"+naturalConstants[i]+"</th>";
		result+="<th>"+constantValues[i].toString()+"</th>";
		result+="<th>"+constantUnits[i]+"</th>";
		result+="<th><input type=\"checkbox\"></th>";
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
	if(actualGoalName == "") return false;
	for(let i=0; i<actualVarNames.length; i++){
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
	$$\\Delta '+actualGoalName+'='+getFinalUncertainty(partialDerivatives).toString()+'$$\
	</div>');

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
	return math.sqrt(result);
}
function getDictionary(){
	var dict = {};
	for(let i=0; i<actualVarNames.length;i++){
		dict[actualVarNames[i].value] = actualVarValues[i].value;
	}
	for( let i=0; i<actualConstNames.length;i++){
		dict[actualConstNames[i].value] = actualConstValues[i].value;
	}
	return dict;
}