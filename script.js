// ============================================
// UNIQUE KEYS FOR ALL COUNTRY AUTO
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
  
  // Calculate Parts Total
  document.querySelectorAll("#partsBody tr").forEach(function(row) {
    let amt = parseFloat(row.querySelector(".part-amt").value) || 0;
    partsTotal += amt;
  });
  
  // Get Labour Total from input field
  let labourTotal = parseFloat(document.getElementById("labourTotalInput").value) || 0;
  
  let subtotal = partsTotal + labourTotal;
  let tax = subtotal * 0.07; // 7% tax
  let deposit = parseFloat(document.getElementById("depositAmount").value) || 0;
  let grandTotal = subtotal + tax - deposit;
  
  document.getElementById("partsTotal").textContent = partsTotal.toFixed(2);
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("taxAmount").textContent = tax.toFixed(2);
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
  
  let depositSection = document.getElementById("depositSection");
  if (deposit === 0) {
    depositSection.classList.add("hide-on-print");
  } else {
    depositSection.classList.remove("hide-on-print");
  }
}

function deleteRow(btn) {
  btn.parentElement.parentElement.remove();
  calculateTotals();
}

// ===== PARTS FUNCTIONS =====
function addPartRow(desc, amt) {
  let body = document.getElementById("partsBody");
  let row = document.createElement("tr");
  let d = desc || "";
  let a = amt || "0.00";
  
  row.innerHTML = '<td><textarea class="part-desc" placeholder="Part description" rows="2" style="width:100%; box-sizing:border-box;">' + d + '</textarea></td>' +
                  '<td><input type="number" class="part-amt" min="0" step="any" value="' + a + '" style="width:95%; box-sizing:border-box; text-align:center;"></td>' +
                  '<td><button class="delete-btn" style="margin:0 auto; display:block;">✖</button></td>';
  
  body.appendChild(row);
  
  let ta = row.querySelector("textarea");
  ta.addEventListener("input", function() { autoExpand(this); });
  autoExpand(ta);
  
  row.querySelector(".part-amt").addEventListener("input", calculateTotals);
  row.querySelector(".delete-btn").addEventListener("click", function() { deleteRow(this); });
  calculateTotals();
}

// ===== EVENT LISTENERS =====
document.getElementById("addPart").addEventListener("click", function() { addPartRow(); });
document.getElementById("labourTotalInput").addEventListener("input", calculateTotals);
document.getElementById("depositAmount").addEventListener("input", calculateTotals);

// ===== SAVE RECEIPT =====
document.getElementById("saveBtn").addEventListener("click", function() {
  calculateTotals();
  
  let receipt = {
    invoiceNo: document.getElementById("invoiceNo").value,
    date: document.getElementById("date").textContent,
    customer: document.getElementById("custName").value.trim(),
    fromStaff: document.getElementById("fromName").value.trim(),
    vehicleModel: document.getElementById("vehicleModel").value.trim(),
    vehicleYear: document.getElementById("vehicleYear").value.trim(),
    vehicleColor: document.getElementById("vehicleColor").value.trim(),
    vehicleVin: document.getElementById("vehicleVin").value.trim(),
    signedBy: document.getElementById("signedBy").value.trim(),
    deposit: document.getElementById("depositAmount").value,
    labourTotal: document.getElementById("labourTotalInput").value,
    partsTotal: document.getElementById("partsTotal").textContent,
    subtotal: document.getElementById("subtotal").textContent,
    taxAmount: document.getElementById("taxAmount").textContent,
    grandTotal: document.getElementById("grandTotal").textContent,
    parts: []
  };
  
  document.querySelectorAll("#partsBody tr").forEach(function(row) {
    receipt.parts.push({
      desc: row.querySelector(".part-desc").value,
      amt: row.querySelector(".part-amt").value
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
  document.getElementById("fromName").value = r.fromStaff || "";
  document.getElementById("vehicleModel").value = r.vehicleModel || "";
  document.getElementById("vehicleYear").value = r.vehicleYear || "";
  document.getElementById("vehicleColor").value = r.vehicleColor || "";
  document.getElementById("vehicleVin").value = r.vehicleVin || "";
  document.getElementById("signedBy").value = r.signedBy || "";
  document.getElementById("depositAmount").value = r.deposit || "0.00";
  document.getElementById("labourTotalInput").value = r.labourTotal || "0.00";
  
  document.getElementById("partsBody").innerHTML = "";
  
  if (r.parts && r.parts.length > 0) {
    r.parts.forEach(function(p) { addPartRow(p.desc, p.amt); });
  } else { addPartRow(); }
  
  calculateTotals();
  window.scrollTo({ top: 0, behavior: "smooth" });
  alert("Loaded invoice #" + r.invoiceNo);
}

// ===== SEARCH RECEIPTS =====
document.getElementById("searchBtn").addEventListener("click", function() {
  let query = document.getElementById("searchInput").value.trim().toLowerCase();
  let results = document.getElementById("searchResults");
  results.innerHTML = "";
  
  let receipts = JSON.parse(localStorage.getItem(RECEIPTS_KEY) || "[]");
  let matches = receipts.filter(function(r) {
    return r.invoiceNo.toLowerCase().includes(query) || r.customer.toLowerCase().includes(query);
  });
  
  if (matches.length === 0) {
    results.innerHTML = "<p>No receipts found.</p>";
    return;
  }
  
  matches.forEach(function(r) {
    let div = document.createElement("div");
    div.className = "found-receipt";
    div.innerHTML = '<strong>Invoice #' + r.invoiceNo + '</strong> | ' + r.date + '<br>' +
                    'Customer: ' + r.customer + ' | Vehicle: ' + r.vehicleModel + ' ' + r.vehicleYear + '<br>' +
                    'From: ' + (r.fromStaff || "") + ' | Signed: ' + (r.signedBy || "N/A") + '<br>' +
                    'Deposit: $' + (r.deposit || "0.00") + ' | Grand Total: $' + r.grandTotal + '<br>' +
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
  a.download = "allcountryauto_receipts_" + new Date().toISOString().split("T")[0] + ".json";
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
  
  document.getElementById("custName").value = "";
  document.getElementById("fromName").value = "";
  document.getElementById("vehicleModel").value = "";
  document.getElementById("vehicleYear").value = "";
  document.getElementById("vehicleColor").value = "";
  document.getElementById("vehicleVin").value = "";
  document.getElementById("signedBy").value = "";
  document.getElementById("depositAmount").value = "0.00";
  document.getElementById("labourTotalInput").value = "0.00";
  document.getElementById("partsBody").innerHTML = "";
  
  addPartRow();
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

// ===== INITIALIZE =====
addPartRow();
calculateTotals();
