// Load invoice data from backend (!IMPORTANT)
let invoiceData = {};

fetch("invoice/data")
  .then((response) => response.json())
  .then((data) => {
    invoiceData = data;
  });

// Rendering Order Fields in Row
export function renderOrderInRow(category, row) {
  row.querySelector(".td_name").innerHTML =
    `<input type="text" class="item_name" placeholder="Item Name">`;

  const labels = {
    frame: "Order Frame",
    lens: "Order Lens",
    contact_lens: "Order Contact Lens",
  };

  row.querySelector(".td_category").innerHTML = labels[category] || category;

  if (category === "lens" || category === "contact_lens") {
    row.querySelector(".td_sphere").innerHTML =
      `<input type="number" step="0.25" class="lens_sphere" placeholder="SPH.">`;
    row.querySelector(".td_cylinder").innerHTML =
      `<input type="number" step="0.25" class="lens_cylinder" placeholder="CYL.">`;
  } else {
    row.querySelector(".td_sphere").innerHTML = "";
    row.querySelector(".td_cylinder").innerHTML = "";
  }

  subtotalCalculation(row);
}

// Auto-fill Frame's Category
export function renderCustomInRow(category, row) {
  row.querySelector(".td_name").innerHTML =
    `<input type="text" class="item_name" placeholder="Item Name">`;
  row.querySelector(".td_category").innerHTML = category;
  subtotalCalculation(row);
}

// Auto-fill Frame's Category
export function setupFrameCategoryAutoFill(row) {
  const productSelect = row.querySelector(".inventory_product_select");
  const categoryInput = row.querySelector(".frame_category");

  if (!productSelect || !categoryInput) return;

  function applyFrameCategory() {
    const Option = productSelect.options[productSelect.selectedIndex];
    categoryInput.value = Option.dataset.frameCategory || "";
  }

  applyFrameCategory();
  productSelect.addEventListener("change", applyFrameCategory);
}

// format SPH./CYL. (+ve, -ve)
export function formatSphCyl(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return value;

  const formattedValue = (num <= 0 ? "" : "+") + num;

  // return num > 0 ? `+${num}` : `${num}`;

  return formattedValue;
}

// Item Subtotal Calculation
export function subtotalCalculation(row) {
  const quantityInput = row.querySelector(".product_quantity");
  const priceInput = row.querySelector(".product_price");
  const subtotalInput = row.querySelector(".product_subtotal");

  if (!quantityInput || !priceInput || !subtotalInput) return;

  function reCalculateSubtotal() {
    subtotalInput.value =
      (Number(quantityInput.value) || 0) * (Number(priceInput.value) || 0);
    calculateTotalAmount();
  }

  quantityInput.addEventListener("input", reCalculateSubtotal);
  priceInput.addEventListener("input", reCalculateSubtotal);
}

// Rendering Inventory Fields in Row
export function renderInventoryInRow(category, row) {
  row.querySelector(".td_name").innerHTML = "";
  row.querySelector(".td_category").innerHTML = "";
  row.querySelector(".td_sphere").innerHTML = "";
  row.querySelector(".td_cylinder").innerHTML = "";

  if (category === "frame") {
    const frames = invoiceData.products_frame_list;
    row.querySelector(".td_name").innerHTML = `
            <select class="inventory_product_select">
                <option selected disabled>Select Product</option>
                ${frames.map((p) => `<option value="${p.id}" data-price="${p.selling_price}" data-frame-category="${p.frame_category || ""}">${p.name}</option>`).join("")}
            </select>
        `;

    row.querySelector(".td_category").innerHTML = `
            <input type="text" class="frame_category" readonly>
        `;

    // const labels = { medical: "Medical", sunglasses: "Sunglasses" };
    // const availableCategories = invoiceData.frame_categories || [];

    // row.querySelector(".td_category").innerHTML = `
    //     <select class="frame_category">
    //         <option selected disabled>Select Category</option>
    //         ${availableCategories.map(c => `<option value="${c}">${labels[c] || c}</option>`).join("")}
    //     </select>
    // `;

    // row.querySelector(".td_category").innerHTML = `
    //     <select class="frame_category">
    //         <option selected disabled>Select Category</option>
    //         <option value="medical">Medical</option>
    //         <option value="sunglasses">Sunglasses</option>
    //     </select>
    // `;

    subtotalCalculation(row);
    setupInventoryAutoFill(row);
    setupFrameCategoryAutoFill(row);
  } else if (category === "lens") {
    const lenses = invoiceData.products_lens_list;
    row.querySelector(".td_name").innerHTML = `
            <select class="inventory_product_select lens_select">
                <option selected disabled>Select Lens</option>
                ${lenses.map((l) => `<option value="${l.product}" data-sphere="${l.sphere}" data-cylinder="${l.cylinder}" data-price="${l.product__selling_price}">${l.product__name}</option>`).join("")}
            </select>
        `;
    row.querySelector(".td_category").innerHTML = `Inventory Optical Lens`;
    row.querySelector(".td_sphere").innerHTML =
      `<input type="text" class="lens_sphere" readonly>`;
    row.querySelector(".td_cylinder").innerHTML =
      `<input type="text" class="lens_cylinder" readonly>`;

    const lensSelect = row.querySelector(".lens_select");
    const sphereInput = row.querySelector(".lens_sphere");
    const cylinderInput = row.querySelector(".lens_cylinder");

    function updateLens() {
      const sel = lensSelect.options[lensSelect.selectedIndex];
      sphereInput.value = formatSphCyl(sel.dataset.sphere);
      // sphereInput.value = sel.dataset.sphere;
      cylinderInput.value = formatSphCyl(sel.dataset.cylinder);
      // cylinderInput.value = sel.dataset.cylinder;
    }
    updateLens();
    lensSelect.addEventListener("change", updateLens);
    subtotalCalculation(row);
    setupInventoryAutoFill(row);
  } else if (category === "contact_lens") {
    const contacts = invoiceData.products_contact_lens_list;
    row.querySelector(".td_category").innerHTML = "Inventory Contact Lens";

    row.querySelector(".td_name").innerHTML = `
            <select class="inventory_product_select">
                <option selected disabled>Select Product</option>
                ${contacts.map((p) => `<option value="${p.id}" data-price="${p.selling_price}">${p.name}</option>`).join("")}
            </select>
        `;
    subtotalCalculation(row);
    setupInventoryAutoFill(row);
  } else if (category === "accessory") {
    const accessories = invoiceData.products_accessory_list;
    row.querySelector(".td_category").innerHTML = "Inventory Accessory";
    row.querySelector(".td_name").innerHTML = `
            <select class="inventory_product_select">
                <option selected>Select Product</option>
                ${accessories.map((p) => `<option value="${p.id}" data-price="${p.selling_price}">${p.name}</option>`).join("")}
            </select>
        `;
    subtotalCalculation(row);
    setupInventoryAutoFill(row);
  }
}

// SET up Total price(T) of Inventory item from Quantity(Q) and selling price (P) T = Q x P
export function setupInventoryAutoFill(container) {
  const productSelect = container.querySelector(".inventory_product_select");

  const priceInput = container.querySelector(".product_price");

  const quantityInput = container.querySelector(".product_quantity");

  const subtotalInput = container.querySelector(".product_subtotal");

  if (!productSelect || !priceInput) {
    return;
  }

  // set readonly (!IMPORTANT)
  priceInput.readOnly = true;

  function updateSubtotal() {
    const quantity = Number(quantityInput.value) || 0;

    const price = Number(priceInput.value) || 0;

    subtotalInput.value = (quantity * price).toFixed(2);

    calculateTotalAmount();

    // subtotalInput.value =
    //     quantity * price;
  }

  function autoFillPrice() {
    const selectedOption = productSelect.options[productSelect.selectedIndex];

    priceInput.value = selectedOption.dataset.price || 0;

    updateSubtotal();
  }

  autoFillPrice();

  productSelect.addEventListener("change", autoFillPrice);

  quantityInput.addEventListener("input", updateSubtotal);

  priceInput.addEventListener("input", updateSubtotal);

  // priceInput.dispatchEvent(
  //     new Event("input")
  // );
}

// Add invoice item row
export function addInvoiceItemRow(source) {
  const tbody = document.getElementById("invoice_items_body");
  const row = document.createElement("tr");

  row.innerHTML = `
        <input type="hidden" class="item_source" value="${source}">
        <td class="td_type"></td>
        <td class="td_name"></td>
        <td class="td_category"></td>
        <td class="td_sphere"></td>
        <td class="td_cylinder"></td>
        <td class="td_qty"><input type="number" class="product_quantity" value="1" min="1"></td>
        <td class="td_price"><input type="number" class="product_price" placeholder="Price"></td>
        <td class="td_subtotal"><input type="number" class="product_subtotal" readonly></td>
        <td class="td_action"><button type="button" class="remove_item_btn">Remove</button></td>
    `;

  tbody.appendChild(row);
  subtotalCalculation(row);
  row.querySelector(".remove_item_btn").addEventListener("click", () => {
    row.remove();
    calculateTotalAmount();
  });

  if (source === "inventory") {
    row.querySelector(".td_type").innerHTML = `
            <select class="inventory_category_select">
                <option selected disabled>Select Category</option>
                <option value="frame">Frame</option>
                <option value="lens">Lens</option>
                <option value="contact_lens">Contact Lens</option>
                <option value="accessory">Accessory</option>
            </select>
        `;
    row
      .querySelector(".inventory_category_select")
      .addEventListener("change", function () {
        renderInventoryInRow(this.value, row);
      });
    // subtotalCalculation(row);
  } else if (source === "order") {
    row.querySelector(".td_type").innerHTML = `
            <select class="order_category_select">
                <option selected disabled>Select Category</option>
                <option value="frame">Order Frame</option>
                <option value="lens">Order Lens</option>
                <option value="contact_lens">Order Contact Lens</option>
            </select>
        `;
    row
      .querySelector(".order_category_select")
      .addEventListener("change", function () {
        renderOrderInRow(this.value, row);
        // renderOrderInRow(this.options[this.selectedIndex].text, row);
      });
    subtotalCalculation(row);
  } else if (source === "custom") {
    row.querySelector(".td_type").innerHTML = `
            <select class="custom_type_select">
                <option selected disabled>Select Custom</option>
                <option value="repairs">Repairs</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
            </select>
        `;
    row.querySelector(".td_name").innerHTML =
      `<input type="text" class="item_name" placeholder="Name">`;
    row
      .querySelector(".custom_type_select")
      .addEventListener("change", function () {
        renderCustomInRow(this.options[this.selectedIndex].text, row);
        // subtotalCalculation(row);
      });
    subtotalCalculation(row);
  }
}

// Calculate Remaining amount(R) from Total(T) and Paid(P) amount  R = T - P
export function calculateRemainingAmount() {
  const amount = Number(document.getElementById("amount").value) || 0;
  const paid = Number(document.getElementById("paid").value) || 0;

  document.getElementById("remaining_amount").value = (amount - paid).toFixed(
    2,
  );
}

// Calculate total prices of items
export function calculateTotalAmount() {
  let total = 0;

  document
    .querySelectorAll("#invoice_items_body .product_subtotal")
    .forEach((input) => {
      total += Number(input.value) || 0;
    });

  document.getElementById("amount").value = total.toFixed(2);

  calculateRemainingAmount();
}


export function toggleInputs(row) {
  let inputs = document.querySelectorAll(`.${row}-input`);
  let checkbox = document.getElementById(`${row}-checkbox`);
  inputs.forEach((input) => {
    input.disabled = !checkbox.checked;
    if (!checkbox.checked) input.value = "";
  });
}

// Toggle Search invoice (changing fields visibility of id and (name and phone) customer search inputs)
export function toggleSearchInvoiceFields() {
  const searchType = document.getElementById("search_invoice_by").value;
  const searchById = document.querySelector(".search_by_id");
  const searchByDetails = document.querySelector(".search_by_details");

  if (searchType === "id") {
    searchById.style.display = "block";
    searchByDetails.style.display = "none";
    document.getElementById("invoice_id").required = true;
    document.getElementById("customer_name").required = false;
    document.getElementById("phone_number").required = false;
  } else {
    searchById.style.display = "none";
    searchByDetails.style.display = "block";
    document.getElementById("invoice_id").required = false;
    document.getElementById("customer_name").required = false;
    document.getElementById("phone_number").required = false;
  }
}


// Toggle Search customer (changing fields visibility of new and existing customer inputs)
export function toggleSearchCustomerFields() {
  // Customer Search type (New, Existing)
  const searchType = document.getElementById("customer_search_type").value;
  // Containers
  const existingCustomer = document.querySelector(".customer_select_container");
  const newCustomer = document.querySelector(".new_name_and_phone_container");
  // Inputs
  const searchClientInput = document.getElementById("search_client_input");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  if (searchType === "existing") {
    existingCustomer.style.display = "block";
    newCustomer.style.display = "none";
    searchClientInput.required = true;
    // document.getElementById("name").required = false;
    nameInput.required = false;
    phoneInput.required = false;
  } else {
    existingCustomer.style.display = "none";
    // searchByDetails.style.display = "block";
    newCustomer.style.display = "flex";

    searchClientInput.required = false;
    // document.getElementById("name").required = true;
    nameInput.required = true;
    phoneInput.required = true;
  }
}

// Filter Clients
export function filterClientsList(event) {
  //   const searchInput = document.getElementById('searchInput').value.toLowerCase();

  //   const listItems = document.querySelectorAll('#itemList li');

  //   listItems.forEach(item => {
  //     const textValue = item.textContent.toLowerCase();

  //     if (textValue.includes(searchInput)) {
  //       item.style.display = "";
  //     } else {
  //       item.style.display = "none";
  //     }
  //   });

  //   const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const searchValue = event.target.value.toLowerCase();
  const resultDisplay = document.getElementById("native_result");

  if (!resultDisplay) return;

  // resultDisplay.textContent = event.target.value || "None";

  const customers = document.querySelectorAll("#clients_List option");

  // resultDisplay.textContent = result || "None";

  let found = false;

  customers.forEach((customer) => {
    const customerName = customer.value.toLowerCase();

    if (customerName.includes(searchValue)) {
      found = true;
    }
  });

  if (searchValue === "") {
    resultDisplay.textContent = "None";
  } else if (found) {
    resultDisplay.textContent = event.target.value;
  } else {
    resultDisplay.textContent = "No customer found";
  }
}

// function renderOrderInRow(category, row) {
//     row.querySelector(".td_name").innerHTML = `<input type="text" class="item_name" placeholder="Item Name">`;
//     row.querySelector(".td_category").innerHTML = category;

//     if (category === "lens" || category === "contact_lens") {
//         row.querySelector(".td_sphere").innerHTML = `<input type="number" class="lens_sphere" placeholder="SPH.">`;
//         row.querySelector(".td_cylinder").innerHTML = `<input type="number" class="lens_cylinder" placeholder="CYL.">`;
//     }
//     subtotalCalculation(row);
// }

// Show printable invoice 
export function showInvoicePrint(invoice) {
  const indexContainer = document.querySelector(".index_container");

  const prescType = invoice.prescription__prescription_type;

  const hasPrescription =
    invoice.prescription__right_sphere != null ||
    invoice.prescription__right_cylinder != null ||
    invoice.prescription__right_axis != null ||
    invoice.prescription__left_sphere != null ||
    invoice.prescription__left_cylinder != null ||
    invoice.prescription__left_axis != null;

  let prescriptionSection = "";

  if (hasPrescription) {
    const dRow =
      prescType === "d"
        ? `<td>${formatSphCyl(invoice.prescription__right_sphere)}</td><td>${formatSphCyl(invoice.prescription__right_cylinder)}</td><td>${invoice.prescription__right_axis}</td><td>${invoice.prescription__ipd}</td><td>${formatSphCyl(invoice.prescription__left_sphere)}</td><td>${formatSphCyl(invoice.prescription__left_cylinder)}</td><td>${invoice.prescription__left_axis}</td>`
        : `<td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;

    // const dRow = prescType === "d"
    //     ? `<td>${invoice.prescription__right_sphere}</td><td>${invoice.prescription__right_cylinder}</td><td>${invoice.prescription__right_axis}</td><td>${invoice.prescription__ipd}</td><td>${invoice.prescription__left_sphere}</td><td>${invoice.prescription__left_cylinder}</td><td>${invoice.prescription__left_axis}</td>`
    //     : `<td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;

    const rRow =
      prescType === "r"
        ? `<td>${formatSphCyl(invoice.prescription__right_sphere)}</td><td>${formatSphCyl(invoice.prescription__right_cylinder)}</td><td>${invoice.prescription__right_axis}</td><td>${invoice.prescription__ipd}</td><td>${formatSphCyl(invoice.prescription__left_sphere)}</td><td>${formatSphCyl(invoice.prescription__left_cylinder)}</td><td>${invoice.prescription__left_axis}</td>`
        : `<td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;

    // const rRow = prescType === "r"
    //     ? `<td>${invoice.prescription__right_sphere}</td><td>${invoice.prescription__right_cylinder}</td><td>${invoice.prescription__right_axis}</td><td>${invoice.prescription__ipd}</td><td>${invoice.prescription__left_sphere}</td><td>${invoice.prescription__left_cylinder}</td><td>${invoice.prescription__left_axis}</td>`
    //     : `<td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;

    prescriptionSection = `
            <section class="prescription_section">
                <h2>Prescription</h2>
                <table class="prescription_table">
                    <thead>
                        <tr>
                            <th rowspan="2"></th>
                            <th colspan="3">R</th>
                            <th rowspan="2">I.P.D</th>
                            <th colspan="3">L</th>
                        </tr>
                        <tr>
                            <th>SPH.</th><th>CYL.</th><th>AX.</th>
                            <th>SPH.</th><th>CYL.</th><th>AX.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>D</td>${dRow}</tr>
                        <tr><td>R</td>${rRow}</tr>
                    </tbody>
                </table>
            </section>
        `;
  }

  // One product
  // const productSection = `
  //     <tr>
  //         <td>${item.item_name || ""}</td>
  //         <td>${item.item_type || ""}</td>
  //         <td>${item.category || ""}</td>
  //         <td>${item.quantity}</td>
  //         <td>${item.price}</td>
  //         <td>${item.subtotal}</td>
  //     </tr>
  // `

  const itemsRows = (invoice.items || [])
    .map(
      (item) => `
        <tr>
            <td>${item.item_name || ""}</td>
            <td>${item.item_type || ""}</td>
            <td>${item.category || ""}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
            <td>${item.subtotal}</td>
        </tr>
    `,
    )
    .join("");

  indexContainer.innerHTML = `
        <button class="print_btn" onclick="window.print()" style="margin:20px;">Print</button>
        <button class="back_to_search_btn" onclick="SearchInvoice()" style="margin:20px;">Back</button>

        <div class="a4_invoice">
            <div class="invoice_header">
                <h1>Optical Store</h1>
                <p>Address: 123 El Books St.</p>
                <p>Phone: +201000000000</p>
                <p>Email: store@email.com</p>
                <hr>
            </div>

            <section class="customer_info_section">
                <p><strong>Invoice #:</strong> ${invoice.id}</p>
                <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
                <p><strong>Customer:</strong> ${invoice.customer__full_name}</p>
                <p><strong>Phone:</strong> ${invoice.customer__phone}</p>
                <p><strong>Pickup Date:</strong> ${new Date(invoice.pickup_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
                <p><strong>Payment:</strong> ${invoice.payment_method}</p>
            </section>

            <section class="items_section">
                <h2>Items</h2>
                <table class="items_table">
                    <thead>
                        <tr>
                            <th>Name</th><th>Type</th><th>Category</th><th>Qty</th><th>Price</th><th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>
            </section>

            ${prescriptionSection}

            <section class="totals_section">
                <p><strong>Total:</strong> ${invoice.total_price} EGP</p>
                <p><strong>Paid:</strong> ${invoice.paid_amount} EGP</p>
                <p><strong>Remaining:</strong> ${invoice.remaining_amount} EGP</p>
                <p><strong>Seller:</strong> ${invoice.seller}</p>
                <p><strong>Notes:</strong> ${invoice.notes || "No notes"}</p>

            </section>

            <div class="invoice_footer">
                <p><em>Thank you for your purchase!</em></p>
            </div>
        </div>
    `;

  // indexContainer.innerHTML = `
  //     <button onclick="window.print()" style="margin:20px;">Print</button>
  //     <button onclick="SearchInvoice()" style="margin:20px;">Back</button>

  //     <div class="a4_invoice">
  //         <div class="invoice_header">
  //             <h1>Optical Store</h1>
  //             <p>Address: 123 El Books St.</p>
  //             <p>Phone: +201000000000</p>
  //             <p>Email: store@email.com</p>
  //             <hr>
  //         </div>

  //         <section class="customer_info_section">
  //             <p><strong>Invoice #:</strong> ${invoice.id}</p>
  //             <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
  //             <p><strong>Customer:</strong> ${invoice.customer__full_name}</p>
  //             <p><strong>Phone:</strong> ${invoice.customer__phone}</p>
  //             <p><strong>Pickup Date:</strong> ${new Date(invoice.pickup_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
  //             <p><strong>Payment:</strong> ${invoice.payment_method}</p>
  //         </section>

  //         <section class="items_section">
  //             <h2>Items</h2>
  //             <table class="items_table">
  //                 <thead>
  //                     <tr>
  //                         <th>Name</th><th>Type</th><th>Category</th><th>Qty</th><th>Price</th><th>Subtotal</th>
  //                     </tr>
  //                 </thead>
  //                 <tbody>
  //                     <tr>
  //                         <td>${item.item_name || ""}</td>
  //                         <td>${item.item_type || ""}</td>
  //                         <td>${item.category || ""}</td>
  //                         <td>${item.quantity}</td>
  //                         <td>${item.price}</td>
  //                         <td>${item.subtotal}</td>
  //                     </tr>
  //                 </tbody>
  //             </table>
  //         </section>

  //         <section class="prescription_section">
  //             <h2>Prescription</h2>
  //             <table class="prescription_table">
  //                 <thead>
  //                     <tr>
  //                         <th colspan="3">R</th>
  //                         <th rowspan="2">I.P.D</th>
  //                         <th colspan="3">L</th>
  //                     </tr>
  //                     <tr>
  //                         <th>SPH.</th><th>CYL.</th><th>AX.</th>
  //                         <th>SPH.</th><th>CYL.</th><th>AX.</th>
  //                     </tr>
  //                 </thead>
  //                 <tbody>
  //                     <tr><td>${formatSphCyl(invoice.prescription__right_sphere)}</td><td>${formatSphCyl(invoice.prescription__right_cylinder)}</td><td>${invoice.prescription__right_axis}</td><td>${invoice.prescription__ipd}</td><td>${formatSphCyl(invoice.prescription__left_sphere)}</td><td>${formatSphCyl(invoice.prescription__left_cylinder)}</td><td>${invoice.prescription__left_axis}</td></tr>
  //                 </tbody>
  //             </table>
  //         </section>

  //         <section class="totals_section">
  //             <p><strong>Total:</strong> ${invoice.total_price} EGP</p>
  //             <p><strong>Paid:</strong> ${invoice.paid_amount} EGP</p>
  //             <p><strong>Remaining:</strong> ${invoice.remaining_amount} EGP</p>
  //             <p><strong>Seller:</strong> ${invoice.seller}</p>
  //             <p><strong>Notes:</strong> ${invoice.notes || "No notes"}</p>

  //         </section>

  //         <div class="invoice_footer">
  //             <p><em>Thank you for your purchase!</em></p>
  //         </div>
  //     </div>
  // `;
}

// prescription data getter function
export function getPrescriptionData() {
  return {
    has_prescription:
      document.getElementById("D-checkbox").checked ||
      document.getElementById("R-checkbox").checked,

    prescription_type: document.getElementById("D-checkbox").checked
      ? "d"
      : "r",

    right_sphere:
      document.querySelector('[name="D_R_SPH"]')?.value ||
      document.querySelector('[name="R_R_SPH"]')?.value,

    right_cylinder:
      document.querySelector('[name="D_R_CYL"]')?.value ||
      document.querySelector('[name="R_R_CYL"]')?.value,

    right_axis:
      document.querySelector('[name="D_R_AX"]')?.value ||
      document.querySelector('[name="R_R_AX"]')?.value,

    left_sphere:
      document.querySelector('[name="D_L_SPH"]')?.value ||
      document.querySelector('[name="R_L_SPH"]')?.value,

    left_cylinder:
      document.querySelector('[name="D_L_CYL"]')?.value ||
      document.querySelector('[name="R_L_CYL"]')?.value,

    left_axis:
      document.querySelector('[name="D_L_AX"]')?.value ||
      document.querySelector('[name="R_L_AX"]')?.value,

    ipd:
      document.querySelector('[name="D_IPD"]')?.value ||
      document.querySelector('[name="R_IPD"]')?.value,

    // Till now
    notes: "",
  };
}
