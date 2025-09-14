var peopleList;
var peopleKey = "People"

var medicationList;
var medicationKey = "Medications"

function w3_open() {
    document.getElementById("mySidebar").style.width = "200px";
    document.getElementById("mySidebar").style.display = "block";
}
function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
}
function addRow(rowDetails) {
    var newRow;
    if(rowDetails){
        newRow= `<table>
                        <tr class="medicationRow">
                            <td>
                                <button class="removeRow w3-button w3-ripple w3-grey" style="z-index:0">x</button>
                            </td>
                            <td>
                                <select id="cboPerson" class="w3-select w3-border" name="People">
                                    <option value="" disabled="" selected=""></option>
                                </select>
                            </td>
                            <td><input value="${rowDetails.medicationName}" id="txtMedicationName" class="w3-input w3-border w3-animate-input" style="width:100%;" placeholder="Herpexia"></td>
                            <td><input value="${rowDetails.dose}" id="txtDose" class="w3-input w3-border w3-animate-input" style="width:100%;" placeholder="100 mg"></td>
                            <td><input value="${rowDetails.prescribingDoctor}" id="txtPrescribingDoctor" class="w3-input w3-border w3-animate-input" style="width:100%;" placeholder="Dr. Jan Itor"></td>
                            <td><input value="${rowDetails.dateLastFilled}" id="txtDateLastFilled" class="w3-input w3-border w3-animate-input" type="date" style="width:100%;" placeholder="Dr. Jan Itor"></td>
                            <td><input value="${rowDetails.numberPillsLeft}" id="txtNumberPillsLeft" value="0" class="w3-input w3-border w3-animate-input" min="0" max="999" step="1.0" type="number" style="width:100%;" placeholder=""></td>
                            <td><input value="${rowDetails.perscriptionNumber}" id="txtPerscriptionNumber" class="w3-input w3-border w3-animate-input" style="width:100%;" placeholder=""></td>
                            <td><input value="${rowDetails.numberRefills}" id="txtNumberRefills" value="0" class="w3-input w3-border w3-animate-input" min="0" max="999" step="1.0" type="number" style="width:100%;" placeholder=""></td>
                        </tr>
                    </table>`  
    }else{
        newRow= `<table>
                        <tr class="medicationRow">
                            <td>
                                <button class="removeRow w3-button w3-ripple w3-grey" style="z-index:0">x</button>
                            </td>
                            <td>
                                <select id="cboPerson" class="w3-select w3-border" name="People">
                                    <option value="" disabled="" selected=""></option>
                                </select>
                            </td>
                            <td><input id="txtMedicationName" class="w3-input w3-border w3-animate-input" style="width:100%;" placeholder="Herpexia"></td>
                            <td><input id="txtDose" class="w3-input w3-border w3-animate-input" style="width:100%;" placeholder="100 mg"></td>
                            <td><input id="txtPrescribingDoctor" class="w3-input w3-border w3-animate-input" style="width:100%;" placeholder="Dr. Jan Itor"></td>
                            <td><input id="txtDateLastFilled" class="w3-input w3-border w3-animate-input" type="date" style="width:100%;" placeholder="Dr. Jan Itor"></td>
                            <td><input id="txtNumberPillsLeft" value="0" class="w3-input w3-border w3-animate-input" min="0" max="999" step="1.0" type="number" style="width:100%;" placeholder=""></td>
                            <td><input id="txtPerscriptionNumber" class="w3-input w3-border w3-animate-input" style="width:100%;" placeholder=""></td>
                            <td><input id="txtNumberRefills" value="0" class="w3-input w3-border w3-animate-input" min="0" max="999" step="1.0" type="number" style="width:100%;" placeholder=""></td>
                        </tr>
                    </table>`   
    }
    

    //https://davidwalsh.name/convert-html-stings-dom-nodes
    let doc = new DOMParser().parseFromString(newRow, 'text/html');
    var theRow = doc.body.querySelector("tr");
    var theDropDown = theRow.querySelector("select")
    var option;
    peopleList.forEach(function (e) {
        option = document.createElement("option");
        option.text = e.personName;
        option.value = e.personName;
        theDropDown.add(option);
    });
    if(rowDetails){
        theDropDown.value = rowDetails.person;
    }
    addRowHandlers(theRow);
    document.getElementById("trackerTableBody").appendChild(theRow);
    saveMedicationDetails();
}
function addRowHandlers(theRow) {
    theRow.querySelectorAll(".removeRow").forEach(function (theButton) {
        theButton.addEventListener("click", function (e) {
            if (this.parentNode.parentNode.parentNode !== null) {
                this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
                saveMedicationDetails();
            }
        });
    });
    theRow.querySelector("#cboPerson").addEventListener("change", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtMedicationName").addEventListener("keyup", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtMedicationName").addEventListener("paste", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtDose").addEventListener("keyup", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtDose").addEventListener("paste", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtPrescribingDoctor").addEventListener("keyup", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtPrescribingDoctor").addEventListener("paste", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtDateLastFilled").addEventListener("change", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtNumberPillsLeft").addEventListener("change", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtPerscriptionNumber").addEventListener("keyup", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtPerscriptionNumber").addEventListener("paste", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtNumberRefills").addEventListener("change", function (e) {
        saveMedicationDetails();
    });
    theRow.querySelector("#txtNumberRefills").addEventListener("paste", function (e) {
        saveMedicationDetails();
    });
}

function saveMedicationDetails(){
    var tempMedications = [];
    document.querySelectorAll(".medicationRow").forEach(function(rowDetails){
        tempMedications.push({person:rowDetails.querySelector("#cboPerson").value,
            medicationName:rowDetails.querySelector("#txtMedicationName").value,
            dose:rowDetails.querySelector("#txtDose").value,
            prescribingDoctor:rowDetails.querySelector("#txtPrescribingDoctor").value,
            dateLastFilled:rowDetails.querySelector("#txtDateLastFilled").value,
            numberPillsLeft:rowDetails.querySelector("#txtNumberPillsLeft").value,
            perscriptionNumber:rowDetails.querySelector("#txtPerscriptionNumber").value,
            numberRefills:rowDetails.querySelector("#txtNumberRefills").value
        });
    });

    localStorage.setItem(medicationKey, JSON.stringify(tempMedications));
    medicationList = tempMedications;
}

function init() {
    loadPeople();
    loadMedications();
    
    //Handlers for clicks
    document.getElementById("AddRow").addEventListener("click", function (e) {
        addRow();
    });
    document.getElementById("AddPersonRow").addEventListener("click", function (e) {
        addPersonRow();
    });
    document.getElementById("importSource").addEventListener("change", function(e){
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileContent = e.target.result;
                processJsonContent(fileContent);
            };
            reader.readAsText(file);
        }else{
            console.log('No file?');
        }
        closeImport();
    });
    document.getElementById("importTextSource").addEventListener("change", function(e){
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileContent = e.target.result;
                processTextContent(fileContent);
            };
            reader.readAsText(file);
        }else{
            console.log('No file?');
        }
        closeImport();
    });

    //Service worker
    registerServiceWorker();
}
function processJsonContent(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        var importedData  = data;
        medicationList = importedData.medicationDetails;
        peopleList = importedData.peopleDetails;
        localStorage.setItem(medicationKey, JSON.stringify(medicationList));
        localStorage.setItem(peopleKey, JSON.stringify(peopleList));
        rebindPeople();
        loadMedications();
    } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Invalid JSON file. Please upload a valid JSON file.');
    }
}
function processTextContent(textString){
    try {
        //The import text format is different that the export text format, maybe standardize later?
        //Interate through each line
         const lines = textString.split(/\r?\n/);
        lines.forEach(function(line, index) {
            const columns = line.split(',');
            console.log(columns);
            medicationList.push(
                {medicationName:columns[0],
                dose:columns[1],
                prescribingDoctor:columns[3]
            });
        });

        //Save the change and rebind
        localStorage.setItem(medicationKey, JSON.stringify(medicationList));
        loadMedications();
    } catch (error) {
        console.error('Error parsing text:', error);
        alert('Invalid text file. Please upload a valid text file.');
    }
}
function exportData(){
    var exportData = {peopleDetails: peopleList, medicationDetails: medicationList};
    const jsonString = JSON.stringify(exportData, null, 2); // Prettify JSON

    downloadFile(jsonString,'MedicationTrackerExport.json',"application/json");
}

function downloadFile(fileData, fileName, mimeType){
    const blob = new Blob([fileData], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);

    const anchorEl = document.createElement("a");
    anchorEl.href = objectUrl;
    anchorEl.download = fileName;

    // Trigger the download
    anchorEl.click();

    // Clean up the object URL
    URL.revokeObjectURL(objectUrl);
}

function addPersonRow() {
    var PeopleTable = document.getElementById("PeopleTable");
    var newRow = `<table><tr>
                                    <td><button class="removePersonRow w3-button w3-ripple w3-grey" style="z-index:0">x</button></td>
                                    <td><input id="txtPerson" value="" class="w3-input w3-border w3-animate-input" type="text" style="width:100%;" placeholder="Person Name"></td>
                          </tr></table>`;
    var doc = new DOMParser().parseFromString(newRow, 'text/html');
    var theRow = doc.body.querySelector("tr");
    theRow.querySelectorAll(".removePersonRow").forEach(function (e) {
        e.addEventListener("click", function (e) {
            PeopleTable.removeChild(this.parentNode.parentNode);
        });
    });
    PeopleTable.appendChild(theRow);
}
function loadPeople() {

    var people = localStorage.getItem(peopleKey);
    if (people == null) {
        //The default person
        people =
            [{ personName: "Jane Doe" }];
        localStorage.setItem(peopleKey, JSON.stringify(people));
    } else {
        people = JSON.parse(people);
    }
    peopleList = people;
}
function loadMedications(){
    var meds = localStorage.getItem(medicationKey);
    if (meds == null){
        //Add a blank row
        addRow();
    }else{
        meds = JSON.parse(meds);
        meds.forEach(function(medicationDetails){
            addRow(medicationDetails);
        });
    }
    medicationList = meds;
}
function showHome() {
    document.getElementById('People').style.display = 'none';
    document.getElementById("mySidebar").style.display = "none";
}
function showPeople() {
    document.getElementById('People').style.display = 'block'
    var PeopleTable = document.getElementById("PeopleTable");
    //Purge
    PeopleTable.innerHTML = "";
    //Header
    var newRow = `<table><tr><th></th><th>Person Name</th></tr></table>`;
    let doc = new DOMParser().parseFromString(newRow, 'text/html');
    var theRow = doc.body.querySelector("tr");
    PeopleTable.appendChild(theRow);
    //People
    peopleList.forEach(function (personDetails) {
        newRow = `<table><tr>
                                    <td><button class="removePersonRow w3-button w3-ripple w3-grey" style="z-index:0">x</button></td>
                                    <td><input id="txtPerson" value="${personDetails.personName}" class="w3-input w3-border w3-animate-input" type="text" style="width:100%;" placeholder="Person Name"></td>
                          </tr></table>`;
        doc = new DOMParser().parseFromString(newRow, 'text/html');
        theRow = doc.body.querySelector("tr");
        //Remove click
        theRow.querySelectorAll(".removePersonRow").forEach(function (e) {
            e.addEventListener("click", function (e) {
                PeopleTable.removeChild(this.parentNode.parentNode);
            });
        });
        PeopleTable.appendChild(theRow);
    });


}
function closePeople() {
    document.getElementById('People').style.display = 'none';
    document.getElementById('mySidebar').style.display = 'none';
    //Save people
    var people = [];
    var PeopleTable = document.getElementById("PeopleTable");
    PeopleTable.querySelectorAll("tr").forEach(function (e) {
        if (e.querySelectorAll("#txtPerson").length > 0) {
            people.push({ personName: e.querySelector("#txtPerson").value});
        }
    });
    localStorage.setItem(peopleKey, JSON.stringify(people));
    peopleList = people;
    rebindPeople();
}
function rebindPeople() {
    document.querySelectorAll("#cboPerson").forEach(function (e) {
        var theDropDown = e;
        var currentValue = theDropDown.value;
        theDropDown.innerHTML = '';
        option = document.createElement("option");
        theDropDown.add(option);
        peopleList.forEach(function (e) {
            option = document.createElement("option");
            option.text = e.personName;
            option.value = e.personName;
            theDropDown.add(option);
        });
        if(currentValue){
            theDropDown.value = currentValue;
        }
    });
}
function showExport(){
    document.getElementById('Export').style.display = 'block'
}
function closeExport(){
    document.getElementById('Export').style.display = 'none';
    document.getElementById('mySidebar').style.display = 'none';
}
function showImport(){
    document.getElementById('Import').style.display = 'block'
}
function closeImport(){
    document.getElementById('Import').style.display = 'none';
    document.getElementById('mySidebar').style.display = 'none';
}
function showImportText(){
    document.getElementById('ImportText').style.display = 'block'
}
function closeImportText(){
    document.getElementById('ImportText').style.display = 'none';
    document.getElementById('mySidebar').style.display = 'none';
}
function printToText(){
    var textString = 'Person, Med. Name, Dose, Dr. Presc., Date Last Filled, # Pills in Bottle, RX #, # Refills \n';
    medicationList.forEach(function(theDetails){
        textString += `${theDetails.person}, ${theDetails.medicationName}, ${theDetails.dose}, ${theDetails.prescribingDoctor}, ${theDetails.dateLastFilled}, ${theDetails.numberPillsLeft}, ${theDetails.perscriptionNumber}, ${theDetails.numberRefills}`;
        textString += '\n'
    });

    downloadFile(textString,'MedicationTracker.txt',"text");
}
function purgeCache(){
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    });
    window.location.reload();
}

function clearData(){
    if(confirm('Are you sure?')){
        medicationList = [];
        peopleList = [];
        localStorage.setItem(medicationKey, JSON.stringify(medicationList));
        localStorage.setItem(peopleKey, JSON.stringify(peopleList));
        window.location.reload();
    }
}

function registerServiceWorker() {
    // Register the service worker
    if ('serviceWorker' in navigator) {
        // Wait for the 'load' event to not block other work
        window.addEventListener('load', async () => {
            // Try to register the service worker.
            try {
                // Capture the registration for later use, if needed
                let reg;

                // Use ES Module version of our Service Worker in development
                //if (import.meta.env?.DEV) {
                //    reg = await navigator.serviceWorker.register('/service-worker.js', {
                //        type: 'module',
                //    });
                //} else {
                //    // In production, use the normal service worker registration
                //    reg = await navigator.serviceWorker.register('/service-worker.js');
                //}

                reg = await navigator.serviceWorker.register('service-worker.js');

                //console.log('Service worker registered! 😎', reg);
            } catch (err) {
                console.log('😥 Service worker registration failed: ', err);
            }
        });
    }
}
init();