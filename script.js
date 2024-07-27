

var narrativesData = {}
var objectsData = {}
var objects = [];
var narratives = [];
var currentSelection = [];
var currentNarrative = "";
var currentValue= "";
var currentSort = "";
var narrativeIcons = {};
var narrativeDesc = {};
var narrativeMaps = {};

window.onresize = function() {
   adjustHeight('data-container', 'figure-container');
};

document.addEventListener("DOMContentLoaded", async function(event) {
	// check if there are information in the query section of the URL
	const urlParams = new URLSearchParams(document.location.search);
	const itemNarrative = urlParams.get("narrative");
	const itemSubnarrative = urlParams.get("subnarrative");
	const itemId = urlParams.get("id");
	const urls = [
		"narrative-data.json",
		"data.json"
	];
	
	if (itemNarrative) {
		currentNarrative = decodeURIComponent(itemNarrative);
	}

	if (itemSubnarrative) {
		currentValue = decodeURIComponent(itemSubnarrative);
	}

	if (itemId) {
		currentSort = decodeURIComponent(itemId);
	}

	
	// // parse NARRATIVE JSON
	// fetch('narrative-data.json')
	// .then(response => response.json())
	// .then(data => {	
	// 	originalData = data

	// 	// populate narrativeIcons 
	// 	originalData.narratives.forEach(narrative => {
    // 		const subnarrativesMap = {};
   	// 	narrative.subnarratives.forEach(sub => {
    //      	subnarrativesMap[sub.name] = sub.icon;
    // 		});
    // 		narrativeIcons[narrative.name] = subnarrativesMap;
	// 	});

	// 	// populate narrativeDesc
	// 	originalData.narratives.forEach(narrative => {
    // 		const subnarrativesMap = {};
   	// 	narrative.subnarratives.forEach(sub => {
    //      	subnarrativesMap[sub.name] = sub.description;
    // 		});
    // 		narrativeDesc[narrative.name] = subnarrativesMap;
	// 	});
	// });

	// // parse DATA JSON
	// fetch('data.json')
	// .then(response => response.json())
	// .then(data => {	

	// 	objects = data.objects;
	// 	var startWith = data.meta.startWith;
	// 	var object = objects[startWith];

	// 	narratives = data.meta.narratives;
		
	// 	if (currentNarrative == "") { 
	// 		currentNarrative = data.meta.startNarrative;
	// 	}
	
	// 	if (currentValue == "") {
	// 		currentValue = data.meta.startValue;
	// 	}
	// 	prepareNarratives();

	// 	// Adjust height after content is prepared
    //     adjustHeight('data-container', 'figure-container');
	// });

	Promise.all(urls.map(url => fetch(url).then(response => response.json())))
		.then(dataArray => {
			narrativesData = dataArray[0];
			objectsData = dataArray[1]
			objects = dataArray[1].objects;

			// populate narrativeIcons 
			narrativesData.narratives.forEach(narrative => {
				const subnarrativesMap = {};
			   narrative.subnarratives.forEach(sub => {
				 subnarrativesMap[sub.name] = sub.icon;
				});
				narrativeIcons[narrative.name] = subnarrativesMap;
			});
	
			// populate narrativeDesc
			narrativesData.narratives.forEach(narrative => {
				const subnarrativesMap = {};
			   narrative.subnarratives.forEach(sub => {
				 subnarrativesMap[sub.name] = sub.description;
				});
				narrativeDesc[narrative.name] = subnarrativesMap;
			});

			// populate NarrativeMaps
			narrativesData.narratives.forEach(narrative => {
				const subnarrativesMap = {};
			   narrative.subnarratives.forEach(sub => {
				 subnarrativesMap[sub.name] = sub.map;
				});
				narrativeMaps[narrative.name] = subnarrativesMap;
			});

			var startWith = objectsData.meta.startWith;
			var object = objects[startWith];
	
			narratives = objectsData.meta.narratives;
			
			if (currentNarrative == "") { 
				currentNarrative = objectsData.meta.startNarrative;
			}
		
			if (currentValue == "") {
				currentValue = objectsData.meta.startValue;
			}
			prepareNarratives();
	
			// Adjust height after content is prepared
			adjustHeight('data-container', 'figure-container');
		})
	
});

document.addEventListener('DOMContentLoaded', function () {
         initObserver();
      });

      document.addEventListener('click', function (event) {
         if (event.target.classList.contains('info-button')) {
            initObserver();
         }
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
   byId("img-modal").src = object.image;
   byId("img-modal").alt = object.data.picData.title;
	createInfoLabel(object)
	createInfoTable(object)
	// map modal
	changeMapModal(object)
	// info
	inner("shortInfo", "<p>" + object.shortInfo + "</p>" + '<a type="button" class="btn info-button" onclick="more()">Tell me more...</a>'); 
	//inner("longerInfo", object.longerInfo + '<a type="button" class="btn info-button" onclick="less()">Tell me less...</a>'); 
	inner("longerInfo","<p>"+object.longerInfo.join("</p><p>")+ '<div class="d-flex justify-content-evenly"><a type="button" class="btn info-button" onclick="less()">Tell me less</a><a type="button" class="btn info-button" onclick="muchMore()">Tell me even more...</a></div></p>'); 
	byId("fullInfo").dataset['uri'] = object.fullInfo
	
	changeNarrativeDescription()
	prepareNavigationButtons(index)

	// Adjust height after showing the info
   adjustHeight('data-container', 'figure-container');
}

function changeMapModal(object) {
	if (currentNarrative == "Dimensions") {
		var map = narrativeMaps[currentNarrative]["Dimensions"]
	} else {
		var map = narrativeMaps[currentNarrative][currentValue]
	};
	document.getElementById("map-modal").src = "" ; 
	document.getElementById("map-modal").src = map ; 

	modalText = "You are currently at picture " + "<strong>"+ object.id +"</strong>"
	inner('object-id', modalText)
}

function changeNarrativeDescription() {
	if (currentNarrative == "Dimensions") {
		var desc = narrativeDesc[currentNarrative]["Dimensions"]
	} else {
		var desc = narrativeDesc[currentNarrative][currentValue]
	};

	inner("narrative-info", desc)
}

function more() {
	hide("shortInfo") ;
	opacityTo0("shortInfo")
	show("longerInfo") ;
	
	hide("fullInfo")
	opacityTo0("fullInfo") ;
}
function less() {
	hide("longerInfo") ;
	opacityTo0("longerInfo")
	show("shortInfo") ;
	hide("fullInfo") ;
}
function muchMore() {
    var uri = byId("fullInfo").dataset['uri'];
    fetch(uri)
        .then(response => response.text())
        .then(data => {
            inner("fullInfoContent", data);
            hide("mainCard");
            show("fullInfo");

            // Initialize observer for new content
            initObserver();

            window.scrollTo(0, 0);
        });
}

function hideFullInfo() {
	hide("longerInfo") ;
	opacityTo0("longerInfo")
	opacityTo0("shortInfo")
	show("shortInfo") ;
	opacityTo0("fullInfo")
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

function opacityTo0(id) {
	document.getElementById(id).classList.remove('visible')
}


function inner(id, content, emptyFirst=true) {
	if(emptyFirst) document.getElementById(id).innerHTML = "" ; 
	document.getElementById(id).innerHTML += content ; 
}

function byId(id) {
	return document.getElementById(id)
}

function initObserver() {
         const cardTexts = document.querySelectorAll('.card-text');

         const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
               if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
                  observer.unobserve(entry.target); // Stop observing after the animation
               }
            });
         }, { threshold: 0.1 });

         cardTexts.forEach(cardText => {
            observer.observe(cardText);
         });
      }

// Adjusting the height of the images in the app
function adjustHeight(referenceId, targetId) {
    var referenceElement = document.getElementById(referenceId);
    var targetElement = document.getElementById(targetId);



    if (referenceElement && targetElement) {
        var referenceHeight = referenceElement.offsetHeight;
        targetElement.style.height = referenceHeight + 'px';
    }
}

// Change the arrow direction for narrative description
document.addEventListener('DOMContentLoaded', function () {
      document.querySelector('.card-footer div').addEventListener('click', function () {
         document.querySelector('.narrative-info').classList.toggle('displayed');
         document.querySelector('.card-footer img').classList.toggle('rotated');
		 document.querySelector('.card-footer').classList.toggle('open');
		 document.querySelectorAll('.nav-button').forEach(button => {
			button.classList.toggle('d-none');
		 })
      });
      document.querySelector('.close-btn').addEventListener('click', function () {
         document.querySelector('.narrative-info').classList.toggle('displayed');
         document.querySelector('.card-footer img').classList.toggle('rotated');
		 document.querySelector('.card-footer').classList.toggle('open');
		 document.querySelectorAll('.nav-button').forEach(button => {
			button.classList.toggle('d-none');
		 })
      });
	})





