var servicesOffered;
var servicesKey = "Services"

function w3_open() {
    document.getElementById("mySidebar").style.width = "200px";
    document.getElementById("mySidebar").style.display = "block";
}
function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
    document.getElementById("openNav").style.display = "inline-block";
}
function addRow() {
    var newRow = `<table>
                                <tr>
                                    <td>
                                        <button class="removeRow w3-button w3-ripple w3-grey" style="z-index:0">x</button>
                                    </td>
                                    <td>
                                        <select id="cboService" class="w3-select w3-border" name="Service">
                                            <option value="" disabled="" selected=""></option>
                                        </select>
                                    </td>
                                    <td><input id="txtCost" value="0" class="w3-input w3-border w3-animate-input" min="0" max="999" step="0.01" type="number" style="width:100%;" placeholder="$$$"></td>
                                    <td><input id="txtNumber" value="1" class="w3-input w3-border w3-animate-input" type="number" step="1" min="1" max="99" style="width:100%;" placeholder="How many?"></td>
                                    <td class="w3-right">
                                        <span id="SubTotal" style="">$0.00</span>
                                    </td>
                                </tr>
                                </table>`

    //https://davidwalsh.name/convert-html-stings-dom-nodes
    let doc = new DOMParser().parseFromString(newRow, 'text/html');
    var theRow = doc.body.querySelector("tr");
    var theDropDown = theRow.querySelector("select")
    var option;
    servicesOffered.forEach(function (e) {
        option = document.createElement("option");
        option.text = e.service;
        option.value = e.cost;
        theDropDown.add(option);
    });
    addRowHandlers(theRow);
    document.getElementById("invoiceTableBody").appendChild(theRow);

}
function addRowHandlers(theRow) {
    theRow.querySelectorAll(".removeRow").forEach(function (theButton) {
        theButton.addEventListener("click", function (e) {
            if (this.parentNode.parentNode.parentNode !== null) {
                this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
                calcGrandTotal();
            }
        });
    });
    theRow.querySelector("#cboService").addEventListener("change", function (e) {
        this.parentNode.parentNode.querySelector("#txtCost").value = parseFloat(this.value).toFixed(2);
        calcSubTotal(this.parentNode.parentNode);
    });
    theRow.querySelector("#txtNumber").addEventListener("change", function (e) {
        calcSubTotal(this.parentNode.parentNode);
    });
    theRow.querySelector("#txtCost").addEventListener("change", function (e) {
        calcSubTotal(this.parentNode.parentNode);
    });
}
function calcSubTotal(theRow) {
    var theCost = parseFloat(theRow.querySelector("#txtCost").value)
    var theNumber = parseFloat(theRow.querySelector("#txtNumber").value)
    theRow.querySelector("#SubTotal").innerText = '$' + (theCost * theNumber).toFixed(2);
    calcGrandTotal();
}
function calcGrandTotal() {
    var grandTotal = 0;
    document.querySelectorAll("#SubTotal").forEach(function (e) {
        grandTotal += parseFloat(e.innerText.replaceAll('$', ''));
    });
    GrandTotal.innerText = '$' + grandTotal.toFixed(2);
}
function init() {
    loadServices();
    //Add a blank row
    addRow();
    //Handler for add click
    document.getElementById("AddRow").addEventListener("click", function (e) {
        addRow();
    });
    document.getElementById("AddServiceRow").addEventListener("click", function (e) {
        addServiceRow();
    });
    //Service worker
    registerServiceWorker();
}
function addServiceRow() {
    var ServicesTable = document.getElementById("ServicesTable");
    var newRow = `<table><tr>
                                    <td><button class="removeServiceRow w3-button w3-ripple w3-grey" style="z-index:0">x</button></td>
                                    <td><input id="txtService" value="" class="w3-input w3-border w3-animate-input" type="text" style="width:100%;" placeholder="Service Description"></td>
                                    <td><input id="txtCost" value="" class="w3-input w3-border w3-animate-input" min="0" max="999" step="0.01" type="number" style="width:100%;" placeholder="$$$"></td>
                          </tr></table>`;
    var doc = new DOMParser().parseFromString(newRow, 'text/html');
    var theRow = doc.body.querySelector("tr");
    theRow.querySelectorAll(".removeServiceRow").forEach(function (e) {
        e.addEventListener("click", function (e) {
            ServicesTable.removeChild(this.parentNode.parentNode);
        });
    });
    ServicesTable.appendChild(theRow);
}
function loadServices() {

    var services = localStorage.getItem(servicesKey);
    if (services == null) {
        //The default services and costs
        services =
            [{ service: "Blow Dry", cost: 15.00 },
            { service: "Cut", cost: 20.00 },
            { service: "Color", cost: 40.00 },
            { service: "Style", cost: 30.00 }];
        localStorage.setItem(servicesKey, JSON.stringify(services));
    } else {
        services = JSON.parse(services);
    }
    servicesOffered = services;
}
function showHome() {
    document.getElementById('Services').style.display = 'none';
    document.getElementById("mySidebar").style.display = "none";
}
function showServices() {
    document.getElementById('Services').style.display = 'block'
    var ServicesTable = document.getElementById("ServicesTable");
    //Purge
    ServicesTable.innerHTML = "";
    //Header
    var newRow = `<table><tr><th></th><th>Service</th><th>Cost</th></tr></table>`;
    let doc = new DOMParser().parseFromString(newRow, 'text/html');
    var theRow = doc.body.querySelector("tr");
    ServicesTable.appendChild(theRow);
    //Services
    servicesOffered.forEach(function (serviceDetails) {
        newRow = `<table><tr>
                                    <td><button class="removeServiceRow w3-button w3-ripple w3-grey" style="z-index:0">x</button></td>
                                    <td><input id="txtService" value="${serviceDetails.service}" class="w3-input w3-border w3-animate-input" type="text" style="width:100%;" placeholder="Service Description"></td>
                                    <td><input id="txtCost" value="${parseFloat(serviceDetails.cost).toFixed(2)}" class="w3-input w3-border w3-animate-input" min="0" max="999" step="0.01" type="number" style="width:100%;" placeholder="$$$"></td>
                          </tr></table>`;
        doc = new DOMParser().parseFromString(newRow, 'text/html');
        theRow = doc.body.querySelector("tr");
        //Remove click
        theRow.querySelectorAll(".removeServiceRow").forEach(function (e) {
            e.addEventListener("click", function (e) {
                ServicesTable.removeChild(this.parentNode.parentNode);
            });
        });
        ServicesTable.appendChild(theRow);
    });


}
function closeServices() {
    document.getElementById('Services').style.display = 'none';
    document.getElementById('mySidebar').style.display = 'none';
    //Save services
    var services = [];
    var ServicesTable = document.getElementById("ServicesTable");
    ServicesTable.querySelectorAll("tr").forEach(function (e) {
        if (e.querySelectorAll("#txtService").length > 0) {
            services.push({ service: e.querySelector("#txtService").value, cost: e.querySelector("#txtCost").value });
        }
    });
    localStorage.setItem(servicesKey, JSON.stringify(services));
    servicesOffered = services;
    rebindServices();
}
function rebindServices() {
    document.querySelectorAll("#cboService").forEach(function (e) {
        var theDropDown = e;
        theDropDown.innerHTML = '';
        option = document.createElement("option");
        theDropDown.add(option);
        servicesOffered.forEach(function (e) {
            option = document.createElement("option");
            option.text = e.service;
            option.value = e.cost;
            theDropDown.add(option);
        });
    });
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