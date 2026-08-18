// ============================================
// UNIQUE KEYS FOR ALL COUNTY AUTO
// ============================================
const INVOICE_KEY = "allCountryAuto_invoiceNo";
const RECEIPTS_KEY = "allCountryAuto_receipts";

document.getElementById("date").textContent = new Date().toLocaleDateString();

let currentInvoiceNo = localStorage.getItem(INVOICE_KEY) || "001";
document.getElementById("invoiceNo").value = currentInvoiceNo;

function autoExpand(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
}

// ===== CALCULATE TOTALS =====
function calculateTotals() {
  let partsTotal = 0;
  
  // Calculate Parts Total from items table
  document.querySelectorAll("#partsBody tr").forEach(function(row) {
    let amt = parseFloat(row.querySelector(".item-amt").value) || 0;
    partsTotal += amt;
  });
  
  let subtotal = partsTotal;
  let tax = subtotal * 0.07; // 7% tax
  let deposit = parseFloat(document.getElementById("depositAmount").value) || 0;
  let grandTotal = subtotal + tax - deposit;
  
  // Update the display
  document.getElementById("partsTotal").textContent = subtotal.toFixed(2);
  document.getElementById("taxAmount").textContent = tax.toFixed(2);
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
  
  // Show/hide deposit section
  let depositSection = document.getElementById("depositSection");
  if (deposit === 0) {
    depositSection.classList.add("hide-on-print");
  } else {
    depositSection.classList.remove("hide-on-print");
  }
  
  // Debug log to check values
  console.log("Subtotal: $" + subtotal.toFixed(2));
  console.log("Tax (7%): $" + tax.toFixed(2));
  console.log("Deposit: $" + deposit.toFixed(2));
  console.log("Total Due: $" + grandTotal.toFixed(2));
}

function deleteRow(btn) {
  btn.parentElement.parentElement.remove();
  calculateTotals();
}

// ===== CALCULATE ITEM AMOUNT =====
function calculateItemAmount(row) {
  let qty = parseFloat(row.querySelector(".item-qty").value) || 0;
  let rate = parseFloat(row.querySelector(".item-rate").value) || 0;
  let amtInput = row.querySelector(".item-amt");
  let calculatedAmount = qty * rate;
  amtInput.value = calculatedAmount.toFixed(2);
  calculateTotals();
}

// ===== ITEMS FUNCTIONS =====
function addItemRow(desc, qty, rate, amt) {
  let body = document.getElementById("partsBody");
  let row = document.createElement("tr");
  let d = desc || "";
  let q = qty || "1";
  let r = rate || "0.00";
  let a = amt || "0.00";
  
  row.innerHTML = '<td><textarea class="item-desc" placeholder="Item description" rows="2">' + d + '</textarea></td>' +
                  '<td><input type="number" class="item-qty" min="0" step="any" value="' + q + '"></td>' +
                  '<td><input type="number" class="item-rate" min="0" step="any" value="' + r + '"></td>' +
                  '<td><input type="number" class="item-amt" min="0" step="any" value="' + a + '" readonly></td>' +
                  '<td><button class="delete-btn">✖</button></td>';
  
  body.appendChild(row);
  
  let ta = row.querySelector("textarea");
  ta.addEventListener("input", function() { autoExpand(this); });
  autoExpand(ta);
  
  let qtyInput = row.querySelector(".item-qty");
  let rateInput = row.querySelector(".item-rate");
  let amtInput = row.querySelector(".item-amt");
  
  qtyInput.addEventListener("input", function() { calculateItemAmount(row); });
  rateInput.addEventListener("input", function() { calculateItemAmount(row); });
  amtInput.addEventListener("input", calculateTotals);
  
  row.querySelector(".delete-btn").addEventListener("click", function() { deleteRow(this); });
  calculateTotals();
}

// ===== EVENT LISTENERS =====
document.getElementById("addPart").addEventListener("click", function() { addItemRow(); });
document.getElementById("depositAmount").addEventListener("input", calculateTotals);

// ===== SAVE RECEIPT =====
document.getElementById("saveBtn").addEventListener("click", function() {
  calculateTotals();
  
  let receipt = {
    invoiceNo: document.getElementById("invoiceNo").value,
    date: document.getElementById("date").textContent,
    dueDate: document.getElementById("dueDate").value || "",
    customer: document.getElementById("custName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    cityStateZip: document.getElementById("cityStateZip").value.trim(),
    vehicleModel: document.getElementById("vehicleModel").value.trim(),
    licensePlate: document.getElementById("licensePlate").value.trim(),
    vehicleMake: document.getElementById("vehicleMake").value.trim(),
    vehicleVin: document.getElementById("vehicleVin").value.trim(),
    vehicleYear: document.getElementById("vehicleYear").value.trim(),
    vehicleMileage: document.getElementById("vehicleMileage").value.trim(),
    vehicleColor: document.getElementById("vehicleColor").value.trim(),
    jobNumber: document.getElementById("jobNumber").value.trim(),
    signedBy: document.getElementById("signedBy").value.trim(),
    authDate: document.getElementById("authDate").value || "",
    paymentMethod: document.getElementById("paymentMethod").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    deposit: document.getElementById("depositAmount").value,
    partsTotal: document.getElementById("partsTotal").textContent,
    taxAmount: document.getElementById("taxAmount").textContent,
    grandTotal: document.getElementById("grandTotal").textContent,
    items: []
  };
  
  document.querySelectorAll("#partsBody tr").forEach(function(row) {
    receipt.items.push({
      desc: row.querySelector(".item-desc").value,
      qty: row.querySelector(".item-qty").value,
      rate: row.querySelector(".item-rate").value,
      amt: row.querySelector(".item-amt").value
    });
  });
  
  let receipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
  
  let existingIndex = receipts.findIndex(function(r) { return r.invoiceNo === receipt.invoiceNo; });
  if (existingIndex !== -1) {
    if (confirm("Invoice #" + receipt.invoiceNo + " already exists. Overwrite?")) {
      receipts[existingIndex] = receipt;
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
      alert("Receipt updated!");
    }
  } else {
    receipts.push(receipt);
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    alert("Receipt saved!");
  }
  
  localStorage.setItem(INVOICE_KEY, receipt.invoiceNo);
});

// ===== LOAD RECEIPT =====
function loadReceiptIntoForm(r) {
  document.getElementById("invoiceNo").value = r.invoiceNo;
  document.getElementById("custName").value = r.customer || "";
  document.getElementById("phone").value = r.phone || "";
  document.getElementById("address").value = r.address || "";
  document.getElementById("cityStateZip").value = r.cityStateZip || "";
  document.getElementById("vehicleModel").value = r.vehicleModel || "";
  document.getElementById("licensePlate").value = r.licensePlate || "";
  document.getElementById("vehicleMake").value = r.vehicleMake || "";
  document.getElementById("vehicleVin").value = r.vehicleVin || "";
  document.getElementById("vehicleYear").value = r.vehicleYear || "";
  document.getElementById("vehicleMileage").value = r.vehicleMileage || "";
  document.getElementById("vehicleColor").value = r.vehicleColor || "";
  document.getElementById("jobNumber").value = r.jobNumber || "";
  document.getElementById("signedBy").value = r.signedBy || "";
  document.getElementById("paymentMethod").value = r.paymentMethod || "";
  document.getElementById("notes").value = r.notes || "";
  document.getElementById("depositAmount").value = r.deposit || "0.00";
  
  if (r.dueDate) document.getElementById("dueDate").value = r.dueDate;
  if (r.authDate) document.getElementById("authDate").value = r.authDate;
  
  document.getElementById("partsBody").innerHTML = "";
  
  if (r.items && r.items.length > 0) {
    r.items.forEach(function(item) { 
      addItemRow(item.desc, item.qty, item.rate, item.amt); 
    });
  } else { 
    addItemRow(); 
  }
  
  calculateTotals();
  window.scrollTo({ top: 0, behavior: "smooth" });
  alert("Loaded invoice #" + r.invoiceNo);
});

// ===== SEARCH RECEIPTS =====
document.getElementById("searchBtn").addEventListener("click", function() {
  let query = document.getElementById("searchInput").value.trim().toLowerCase();
  let results = document.getElementById("searchResults");
  results.innerHTML = "";
  
  let receipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
  let matches = receipts.filter(function(r) {
    return r.invoiceNo.toLowerCase().includes(query) || 
           r.customer.toLowerCase().includes(query) ||
           r.vehicleMake.toLowerCase().includes(query) ||
           r.vehicleModel.toLowerCase().includes(query);
  });
  
  if (matches.length === 0) {
    results.innerHTML = "<p>No receipts found.</p>";
    return;
  }
  
  matches.forEach(function(r) {
    let div = document.createElement("div");
    div.className = "found-receipt";
    div.innerHTML = '<strong>Invoice #' + r.invoiceNo + '</strong> | ' + r.date + '<br>' +
                    'Customer: ' + r.customer + ' | Vehicle: ' + r.vehicleMake + ' ' + r.vehicleModel + '<br>' +
                    'Phone: ' + (r.phone || "N/A") + ' | RO/Job #: ' + (r.jobNumber || "N/A") + '<br>' +
                    'Deposit: $' + (r.deposit || "0.00") + ' | Total Due: $' + r.grandTotal + '<br>' +
                    '<button class="viewBtn">Load Invoice</button> ' +
                    '<button class="deleteBtn">Delete</button><hr>';
    
    div.querySelector(".viewBtn").addEventListener("click", function() {
      loadReceiptIntoForm(r);
    });
    
    div.querySelector(".deleteBtn").addEventListener("click", function() {
      if (confirm("Delete invoice #" + r.invoiceNo + "?")) {
        let all = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
        let filtered = all.filter(function(x) { return x.invoiceNo !== r.invoiceNo; });
        localStorage.setItem(RECEIPTS_KEY, JSON.stringify(filtered));
        div.remove();
        alert("Invoice deleted.");
      }
    });
    
    results.appendChild(div);
  });
});

// ===== EXPORT RECEIPTS =====
document.getElementById("exportBtn").addEventListener("click", function() {
  let receipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
  let data = { receipts: receipts };
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "allcountyauto_receipts_" + new Date().toISOString().split("T")[0] + ".json";
  a.click();
  URL.revokeObjectURL(url);
  alert("Exported " + receipts.length + " receipts!");
});

// ===== IMPORT RECEIPTS =====
document.getElementById("importBtn").addEventListener("click", function() {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", function(event) {
  let file = event.target.files[0];
  if (!file) return;
  
  let reader = new FileReader();
  reader.onload = function(e) {
    try {
      let data = JSON.parse(e.target.result);
      let existingReceipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
      let mergedReceipts = [...existingReceipts];
      
      if (data.receipts && data.receipts.length > 0) {
        data.receipts.forEach(function(newReceipt) {
          let exists = mergedReceipts.some(function(r) { return r.invoiceNo === newReceipt.invoiceNo; });
          if (!exists) {
            mergedReceipts.push(newReceipt);
          }
        });
      }
      
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(mergedReceipts));
      alert("Imported " + data.receipts.length + " receipts!");
      location.reload();
    } catch(err) {
      alert("Invalid file!");
    }
  };
  reader.readAsText(file);
});

// ===== PRINT =====
document.getElementById("printBtn").addEventListener("click", function() { 
  calculateTotals();
  window.print(); 
});

// ===== NEW INVOICE =====
document.getElementById("newBtn").addEventListener("click", function() {
  let newNumber = (parseInt(currentInvoiceNo) + 1).toString().padStart(3, "0");
  document.getElementById("invoiceNo").value = newNumber;
  currentInvoiceNo = newNumber;
  localStorage.setItem(INVOICE_KEY, currentInvoiceNo);
  
  // Clear all fields
  document.getElementById("custName").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";
  document.getElementById("cityStateZip").value = "";
  document.getElementById("vehicleModel").value = "";
  document.getElementById("licensePlate").value = "";
  document.getElementById("vehicleMake").value = "";
  document.getElementById("vehicleVin").value = "";
  document.getElementById("vehicleYear").value = "";
  document.getElementById("vehicleMileage").value = "";
  document.getElementById("vehicleColor").value = "";
  document.getElementById("jobNumber").value = "";
  document.getElementById("signedBy").value = "";
  document.getElementById("paymentMethod").value = "";
  document.getElementById("notes").value = "";
  document.getElementById("depositAmount").value = "0.00";
  document.getElementById("dueDate").value = "";
  document.getElementById("authDate").value = "";
  document.getElementById("partsBody").innerHTML = "";
  
  addItemRow();
  calculateTotals();
});

// ===== RESET INVOICE NO =====
document.getElementById("resetBtn").addEventListener("click", function() {
  if (confirm("Reset invoice number back to 001?")) {
    document.getElementById("invoiceNo").value = "001";
    currentInvoiceNo = "001";
    localStorage.setItem(INVOICE_KEY, "001");
  }
});

// ===== CLEAR ALL RECEIPTS =====
document.getElementById("clearAllBtn").addEventListener("click", function() {
  if (confirm("⚠️ WARNING: This will delete ALL saved receipts. Are you absolutely sure?")) {
    localStorage.removeItem(RECEIPTS_KEY);
    localStorage.removeItem(INVOICE_KEY);
    alert("All receipts have been cleared. Page will now reload.");
    location.reload();
  }
});

// ===== TEST TAX BUTTON =====
document.getElementById("testBtn").addEventListener("click", function() {
  // Manually set test values
  document.getElementById("partsTotal").textContent = "2500.00";
  let subtotal = 2500.00;
  let tax = subtotal * 0.07;
  document.getElementById("taxAmount").textContent = tax.toFixed(2);
  let deposit = parseFloat(document.getElementById("depositAmount").value) || 0;
  let grandTotal = subtotal + tax - deposit;
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
  alert("Test: Subtotal $2500.00 + Tax $" + tax.toFixed(2) + " = Total Due $" + grandTotal.toFixed(2));
});

// ===== INITIALIZE =====
addItemRow();
calculateTotals();
