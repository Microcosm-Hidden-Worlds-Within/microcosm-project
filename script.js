var objects = []
var narratives = []
var currentSelection = []
var currentNarrative = ""
var currentValue= ""
var currentSort = ""


document.addEventListener("DOMContentLoaded", async function(event) {
	console.log("Ready to start with phase 4");
	
	fetch('data.json')
	.then(response => response.json())
	.then(data => {	
		objects = data.objects;
		var startWith = data.meta.startWith;
		var object = objects[startWith];

		narratives = data.meta.narratives;
		currentNarrative = data.meta.startNarrative;
		currentValue = data.meta.startValue;
   
		prepareNarratives();
	});
});

function prepareNarratives() {
	if (currentNarrative == "dimensions") {
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
	inner("shortInfo", object.shortInfo + '<a type="button" class="btn btn-outline-primary btn-sm" onclick="more()">Tell me more...</a>'); 
	//inner("longerInfo","<p>"+object.longerInfo.join("</p><p>")+ '<a type="button" class="btn btn-outline-primary btn-sm" onclick="less()">Tell me less</a> or <a type="button" class="btn btn-outline-primary btn-sm" onclick="muchMore()">Tell me even more...</a></p>'); 
	byId("fullInfo").dataset['uri'] = object.fullInfo
	
	prepareNavigationButtons(index)
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
		if (object.data.subjectData[i] !== null) {
			if (narratives.includes(i)) {
				var items = object.data.subjectData[i].split(", ")
				var val = []
				for (j in items) {
					val.push('<a class="button" role="button" href="#" onclick="changeNarrative(\''+i+'\',\''+items[j]+'\')">'+items[j]+'</a>')
				}
			inner("infoTable1","<tr><th>"+i+"</th><td>"+val.join(", ")+"</td></tr>", false)
			}
		}
	}
	inner("infoTable2","",true) ;
	for (i in object.data.picData) {
		if (object.data.picData[i] !== null) {
			if (narratives.includes(i)) {
				var items = object.data.picData[i].split(", ")
				var val = []
				for (j in items) {
					val.push('<a class="button" role="button" href="#" onclick="changeNarrative(\''+i+'\',\''+items[j]+'\')">'+items[j]+'</a>')
				}
			inner("infoTable2","<tr><th>"+i+"</th><td>"+val.join(", ")+"</td></tr>", false)
			}
		}
	}
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
	if (currentNarrative == "dimensions") {
		inner("narrative", currentNarrative, true)
	} else {
		inner("narrative", currentValue, true)
	}
}

function changeNarrative(narrative,value) {
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