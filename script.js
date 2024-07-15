var objects = []
var narratives = []
var currentSelection = []
var currentNarrative = ""
var currentValue= ""
var currentSort = ""
var narrativeIcons = {}
var narrativeDesc = {}

document.addEventListener("DOMContentLoaded", async function(event) {

	// check if there are information in the query section of the URL
	const urlParams = new URLSearchParams(document.location.search);
	const itemNarrative = decodeURIComponent(urlParams.get("narrative"));
	const itemSubnarrative = decodeURIComponent(urlParams.get("subnarrative"));
	const itemId = decodeURIComponent(urlParams.get("id"));
	
	if (itemNarrative) {
		currentNarrative = itemNarrative;
	}
	if (itemSubnarrative) {
		currentValue = itemSubnarrative;
	}
	if (itemId) {
		currentSort = itemId;
	}
	
	// parse NARRATIVE JSON
	fetch('narrative-data.json')
	.then(response => response.json())
	.then(data => {	
		originalData = data

		// populate narrativeIcons 
		originalData.narratives.forEach(narrative => {
    		const subnarrativesMap = {};
   		narrative.subnarratives.forEach(sub => {
         	subnarrativesMap[sub.name] = sub.icon;
    		});
    		narrativeIcons[narrative.name] = subnarrativesMap;
		});

		// populate narrativeDesc
		originalData.narratives.forEach(narrative => {
    		const subnarrativesMap = {};
   		narrative.subnarratives.forEach(sub => {
         	subnarrativesMap[sub.name] = sub.description;
    		});
    		narrativeDesc[narrative.name] = subnarrativesMap;
		});
	});
	

	// parse DATA JSON
	fetch('data.json')
	.then(response => response.json())
	.then(data => {	

		objects = data.objects;
		var startWith = data.meta.startWith;
		var object = objects[startWith];

		narratives = data.meta.narratives;
		
		if (currentNarrative == "") { 
			currentNarrative = data.meta.startNarrative;
		}
		if (currentValue == "") {
			currentValue = data.meta.startValue;
		}
		
		console.log(currentValue);
   
		prepareNarratives();
	});

	
});

function prepareNarratives() {
	if (currentNarrative == "Dimensions") {
      currentSelection = objects
   } else {
      currentSelection = objects.filter( i => 
		i.data.picData[currentNarrative]?.includes(currentValue)
		)
		// if narrative is not in picData, check subjectData
		if (currentSelection.length == 0) {
		currentSelection = objects.filter( i =>
		i.data.subjectData[currentNarrative]?.includes(currentValue)
		)}
	}
   // sort the objects by id
	currentSelection.sort( (i,j) =>  
		i['id'] < j['id'] ? -1 : 1 
	)
  
	if (currentSelection.length==0) 
		currentSelection = objects	

	var index  = currentSelection.findIndex( i => i['id'] == currentSort )
	if (index == -1) index = 0
	showInfo(index)
}

function showInfo(index) {
	var object = currentSelection[index]
	currentSort = object['id']
	inner("header", object.name);
	inner("fullHeader", object.name);
	// change the image
	byId("img").src = object.image;
	byId("img").alt = object.data.picData.title;
	// change the modal 
   byId("modal").src = object.image;
   byId("modal").alt = object.data.picData.title;
	createInfoLabel(object)
	createInfoTable(object)
	// info
	inner("shortInfo", object.shortInfo + '<a type="button" class="btn info-button" onclick="more()">Tell me more...</a>'); 
	//inner("longerInfo", object.longerInfo + '<a type="button" class="btn info-button" onclick="less()">Tell me less...</a>'); 
	inner("longerInfo","<p>"+object.longerInfo.join("</p><p>")+ '<a type="button" class="btn info-button" onclick="less()">Tell me less</a> or <a type="button" class="btn info-button" onclick="muchMore()">Tell me even more...</a></p>'); 
	byId("fullInfo").dataset['uri'] = object.fullInfo
	
	changeNarrativeDescription()
	prepareNavigationButtons(index)
}

function changeNarrativeDescription() {
	if (currentNarrative == "Dimensions") {
		var desc = narrativeDesc[currentNarrative]["From the smallest to the biggest"]
	} else {
		var desc = narrativeDesc[currentNarrative][currentValue]
	};
	console.log(desc);
	inner("narrative-info", desc)
}

function more() {
	hide("shortInfo") ;
	show("longerInfo") ;
	hide("fullInfo") ;
}
function less() {
	hide("longerInfo") ;
	show("shortInfo") ;
	hide("fullInfo") ;
}
function muchMore() {
	var uri = byId("fullInfo").dataset['uri']
	fetch(uri)
	.then(response => response.text())
	.then(data => {	
		inner("fullInfoContent",data) ;
		hide("mainCard") ;
		show("fullInfo") ;
		window.scrollTo(0,0)
	})
}

function hideFullInfo() {
	hide("longerInfo") ;
	show("shortInfo") ;
	hide("fullInfo") ;
	show("mainCard") ;
}

function createInfoLabel(object) {
	inner("caption", "<i>"+ object.data.picData.title +"</i>, " + object.data.picData.author, true)
}

// table
function createInfoTable(object) {
	inner("infoTable1","",true) ;
	for (i in object.data.subjectData) {
		var mainNarrative = i
		// check if the narrative has a value
		if (object.data.subjectData[i] !== null) {
			// check if i is a narrative
			if (narratives.includes(i)) {
				var items = object.data.subjectData[i].split(", ")
				var val = []
				if (mainNarrative !== 'Dimensions') {
					for (j in items) {
						var subNarrative = items[j]
						var icon = narrativeIcons[mainNarrative][subNarrative];
						//val.push('<a class="button" role="button" href="#" onclick="changeNarrative(\''+i+'\',\''+items[j]+'\')">'+items[j]+'</a>')
						// creating narrative buttons 
						val.push(`<a class="narrative-button" role="button" href="#" onclick="changeNarrative('${mainNarrative}', '${subNarrative}')"><img src="${icon}" class="narrative-icon"></a>`)
					}
				} else {	
					// create dimensions button
					val.push(`<a class="narrative-button" role="button" href="#" onclick="changeNarrative('${mainNarrative}', '${mainNarrative}')"><img src="icons/dimension.png" class="narrative-icon"><p>${items[0]}</p></a>`)
				}
			inner("infoTable1","<tr><th>"+mainNarrative+"</th><td>"+val.join("")+"</td></tr>", false)
			}
		}
	}
	inner("infoTable2","",true) ;
	for (i in object.data.picData) {
		var mainNarrative = i
		if (object.data.picData[i] !== null) {
			if (narratives.includes(i)) {
				var items = object.data.picData[i].split(", ")
				var val = []
				for (j in items) {
					var subNarrative = items[j]
					var icon = narrativeIcons[mainNarrative][subNarrative];

					val.push(`<a class="narrative-button" role="button" href="#" onclick="changeNarrative('${mainNarrative}', '${subNarrative}')"><img src="${icon}" class="narrative-icon"><p>${items[j]}</p></a>`)
				}
			inner("infoTable2","<tr><th>"+i+"</th><td>"+val.join("")+"</td></tr>", false)
			}
		}
	}
	setActiveNarrative(currentValue)
}


// change color of the active icon
function setActiveNarrative(currentValue) {
	console.log(currentValue);
	let buttons = document.querySelectorAll('.narrative-button');
	buttons.forEach(button => {
    // Extract the value of the onclick attribute
    let onclickValue = button.getAttribute('onclick');
    
    // Check if the onclick attribute contains "ciao" as the value for ${subNarrative}
    if (onclickValue.includes(currentValue)) {
        button.classList.add('active-narrative');
		  
 
    }
});
}

// navigation buttons
function prepareNavigationButtons(index) {
	if (index > 0) {
		byId("buttonPrevious").disabled = false
		byId("buttonPrevious").onclick = () => showInfo(index-1)
		byId("buttonPrevious").innerHTML = "Previous"	
	} else {
		byId("buttonPrevious").disabled = true
		byId("buttonPrevious").onclick = null
		byId("buttonPrevious").innerHTML = "--"
	}
	if (index < currentSelection.length-1) {
		byId("buttonNext").disabled = false
		byId("buttonNext").onclick = () => showInfo(index+1)
		byId("buttonNext").innerHTML = "Next"
	} else {
		byId("buttonNext").disabled = true
		byId("buttonNext").onclick = null
		byId("buttonNext").innerHTML = "--"
	}
	if (currentNarrative == "Dimensions") {
		inner("narrative", currentNarrative, true)
	} else {
		inner("narrative", currentValue, true)
	}
}

function changeNarrative(narrative, value) {
		currentNarrative = narrative
		currentValue = value
		prepareNarratives()
}

function show(id) {
	document.getElementById(id).classList.remove('d-none')
}

function hide(id) {
	document.getElementById(id).classList.add('d-none')
}

function inner(id, content, emptyFirst=true) {
	if(emptyFirst) document.getElementById(id).innerHTML = "" ; 
	document.getElementById(id).innerHTML += content ; 
}

function byId(id) {
	return document.getElementById(id)
}