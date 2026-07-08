import { renderOrderInRow, renderCustomInRow, setupFrameCategoryAutoFill, formatSphCyl, subtotalCalculation, renderInventoryInRow, setupInventoryAutoFill, addInvoiceItemRow, calculateRemainingAmount, calculateTotalAmount, toggleInputs, toggleSearchInvoiceFields, toggleSearchCustomerFields, filterClientsList, showInvoicePrint, getPrescriptionData } from './helpers.js';

window.addInvoiceItemRow = addInvoiceItemRow;
window.toggleInputs = toggleInputs;
window.toggleSearchInvoiceFields = toggleSearchInvoiceFields;
window.filterClientsList = filterClientsList;
window.SearchInvoice = SearchInvoice;

document.addEventListener("DOMContentLoaded", () => {
    userDashboard();
    const DashboardLink = document.querySelector(".dashboard_link");
    if (DashboardLink) {
        DashboardLink.addEventListener("click", () => {
            DashboardLink.parentElement.parentElement.classList.add("hidden_menu");
            // DashboardLink.parentElement.parentElement.style.display = "none";
            userDashboard();
        });
    }
    const addInvoiceLink = document.querySelector(".add_invoice_link");
    if (addInvoiceLink) {
        addInvoiceLink.addEventListener("click", () => {
            addInvoiceLink.parentElement.parentElement.classList.add("hidden_menu");
            // addInvoiceLink.parentElement.parentElement.style.display = "none";
            createInvoice();

        });
        // createInvoice();
    }

    const searchInvoiceLink = document.querySelector(".search_invoices_link")
    if (searchInvoiceLink) {
        searchInvoiceLink.addEventListener("click", () => {
            // searchInvoiceLink.parentElement.parentElement.classList.add("hidden_menu");
            // searchInvoiceLink.parentElement.parentElement.style.display = "none";
            SearchInvoice();
            toggleSearchInvoiceFields();
        });
        // createInvoice();
    }
});


function userDashboard(event) {

    // event.preventDefault();
    const indexContainer = document.querySelector(".index_container");

    fetch('dashboard')
        .then(response => response.json())
        .then(data => {
            indexContainer.innerHTML = `

                    <div class="dashboard_container">

                        <div class="dashboard_header">
                            
                            
                        </div>

                        <div class="dashboard_cards">

                            <div class="dashboard_card">
                                <h3>Total Products: ${data.total_products_count}</h3>
                            </div>

                            <div class="dashboard_card">
                                <h3>Total Customers: ${data.total_customers}</h3>
                            </div>

                            <div class="dashboard_card">
                                <h3>Total Sales: ${data.total_sales} EGP</h3>
                            </div>

                            <div class="dashboard_card">
                                <h3>Total Invoices: ${data.total_sales_count}</h3>
                            </div>

                        </div>

                        <div class="dashboard_section">
                            <h2>Products</h2>

                            <ul class="dashboard_list">
                                ${data.total_products.map(product => {
                return `
                                        <li class="dashboard_item">
                                            <h4>${product.name}</h4>

                                            <p>
                                                Qty: ${product.quantity}
                                            </p>

                                            <p>
                                                Category: ${product.category}
                                            </p>

                                            <p>
                                                Barcode: ${product.barcode}
                                            </p>

                                            <p>
                                                Purchase Price: ${product.purchase_price}
                                            </p>

                                            <p>
                                                Selling Price: ${product.selling_price}
                                            </p>
                                        </li>
                                    `
            }).join("")}
                            </ul>
                        </div>


                        <div class="dashboard_section">
                            <h2>Low Stock Warning</h2>

                            <ul class="dashboard_list">
                                ${data.low_stock_products.map(product => `
                                    <li class="dashboard_item low_stock">
                                        <p 
                                            class="product_link"
                                            data-id="${product.id}"
                                        >
                                            ${product.name}
                                        </p>

                                        <p>
                                            Remaining Qty: ${product.quantity}
                                        </p>
                                    </li>
                                `).join("")}
                            </ul>
                        </div>


                        <div class="dashboard_section">
                            <h2>Today Sales</h2>

                            <ul class="dashboard_list">
                                ${data.total_sales_today.map(sale => {

                const date = new Date(sale.created_at);

                const formatDate = new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                }).format(date);

                return `
                                        <li class="dashboard_item">

                                            <p 
                                                class="customer_sales"
                                                data-id="${sale.customer__id}"
                                            >
                                                Customer: ${sale.customer__full_name}
                                            </p>

                                            <p>
                                                Total Price: ${sale.total_price} EGP
                                            </p>

                                            <p>
                                                Date: ${formatDate}
                                            </p>

                                        </li>
                                    `
            }).join("")}
                            </ul>
                        </div>


                        <div class="dashboard_section">
                            <h2>Top Selling Products</h2>

                            <ul class="dashboard_list">
                                ${data.top_10_products.map(product => `
                                    <li class="dashboard_item">

                                        <p>
                                            Customer:
                                            ${product.invoice__customer__full_name}
                                        </p>

                                        <p>
                                            Product:
                                            ${product.product__name}
                                        </p>

                                        <p>
                                            Quantity:
                                            ${product.quantity}
                                        </p>

                                        <p>
                                            Price:
                                            ${product.price}
                                        </p>

                                        <p>
                                            Invoice Total:
                                            ${product.invoice__total_price}
                                        </p>

                                    </li>
                                `).join("")}
                            </ul>
                        </div>

                    </div>

                    `;
        })
        .catch(error => console.error('Error:', error));

}

function createInvoice(event) {
    // event.preventDefault();

    const indexContainer = document.querySelector(".index_container");

    indexContainer.innerHTML = "";

    fetch('invoice/data')
        .then(response => response.json())
        .then(data => {
            // console.log(data);

            // invoiceData = data;

            // document.getElementById("add_item_btn").addEventListener("click", addInvoiceItemRow);
            // document.getElementById("add_frame_btn").addEventListener("click", () => {
            //         addInvoiceItemRow("frame");
            //     });

            // document.getElementById("add_lens_btn").addEventListener("click", () => {
            //         addInvoiceItemRow("lens");
            //     });

            // document.getElementById("add_other_btn").addEventListener("click", () => {
            //         addInvoiceItemRow("other");
            //     });

            indexContainer.innerHTML = `
                                        <div class="create_invoice_container form_container">
                                        <div class="form_name">
                                            <h1>Add Invoice</h1>
                                        </div>
                                        <form id="create_invoice_form">
                                            <div class="row invoice-id">
                                                <label for="id">Invoice Number:</label> 
                                                <p>${data.new_invoice_count}</p>
                                            </div>

                                            <div class="row">

                                                <select id="customer_search_type" name="customer_type">
                                                    <!--<option selected disabled>Select Customer Type</option>-->
                                                    <option value="new" selected>New Customer</option>
                                                    <option value="existing">Existing Customer</option>
                                                </select>

                                            </div>

                                            <div class="row customer_select_container">

                                                <div class="customer_select">

                                                    <label for="customer_select">
                                                        Select Existing Customer:
                                                    </label>

                                                    <!--<select id="customer_select" name="customer_id">

                                                        <option value="">
                                                            Choose Customer
                                                        </option>

                                                        ${data.customers_info.map(customer => `
                                                            <option value="${customer.id}">
                                                                ${customer.full_name} - ${customer.phone}
                                                            </option>
                                                        `).join("")}

                                                    </select>-->

                                                    <div class="search_box">
                                                    <!--<input type="text" id="search_client_input" placeholder="Search Client..." oninput="filterClientsList()" required>-->
                                                    <input type="text" id="search_client_input" list="clients_List" placeholder="Search Client..." oninput="filterClientsList(event)" required>
                                                    </div>

                                                    <datalist id="clients_List">
                                                        ${data.customers_info.map(customer => `
                                                            <option value="${customer.full_name}" 
                                                            data-id="${customer.id}" > 
                                                                ${customer.phone} 
                                                            </option>
                                                        `).join("")}
                                                    </datalist>
                                                    
                                                    <!--<p>Selected Result: <span id="native_result" style="font-weight:bold;">None</span></p>-->
                                                </div>

                                            </div>

                                            <div class="row new_name_and_phone_container">
                                                <div class="name">
                                                    <label for="name">Name:</label>
                                                    <input type="text" id="name" name="name">
                                                </div>

                                                <div class="phone">
                                                    <label for="phone">Phone Number:</label>
                                                    <input type="text" id="phone" name="phone_no">
                                                </div>
                                            </div>



                                            <!--<div class="row">
                                                <div class="name">
                                                    <label for="name">Name:</label>
                                                    <input type="text" id="name" name="name">
                                                </div>
                                                <div class="phone">
                                                    <label for="phone">Phone Number:</label>
                                                    <input type="text" id="phone" name="phone_no">
                                                </div>
                                            </div>-->

                                            <div class="invoice_items_section">

                                                <h3>Invoice Items</h3>
                                                <div class="inventory_buttons">


                                                    <button type="button"
                                                        onclick="addInvoiceItemRow('inventory')">
                                                        + Inventory
                                                    </button>

                                                    <button type="button"
                                                        onclick="addInvoiceItemRow('order')">
                                                        + Order
                                                    </button>

                                                    <button type="button"
                                                        onclick="addInvoiceItemRow('custom')">
                                                        + Custom
                                                    </button>



                                                </div>
                                                <table class="invoice_items_table">

                                                    <thead>
                                                        <!--<tr>
                                                            <th>Product</th>
                                                            <th>Quantity</th>
                                                            <th>Price</th>
                                                            <th>Subtotal</th>
                                                            <th>Action</th>
                                                        </tr>-->

                                                        <tr>
                                                            <th rowspan="2">Type</th>
                                                            <th colspan="4">Details</th>
                                                            <th rowspan="2">Qty</th>
                                                            <th rowspan="2">Price</th>
                                                            <th rowspan="2">Subtotal</th>
                                                            <th rowspan="2">Action</th>
                                                        </tr>

                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Category</th>
                                                            <th>Sphere</th>
                                                            <th>Cylinder</th>
                                                        </tr>

                                                    </thead>

                                                    <tbody id="invoice_items_body">

                                                    </tbody>

                                                </table>


                                                <div class="products_container">
                                                

                                                    <!--<div class="inventory_buttons">

                                                        <h4>Inventory Items</h4>

                                                        <button type="button"
                                                            onclick="addInvoiceItemRow('inventory','frame')">
                                                            + Inventory Frame
                                                        </button>

                                                        <button type="button"
                                                            onclick="addInvoiceItemRow('inventory','lens')">
                                                            + Inventory Lens
                                                        </button>

                                                        <button type="button"
                                                            onclick="addInvoiceItemRow('inventory','other')">
                                                            + Inventory Other
                                                        </button>

                                                    </div>

                                                    <div class="custom_buttons">

                                                        <h4>Custom Items</h4>

                                                        <button type="button"
                                                            onclick="addInvoiceItemRow('custom','frame')">
                                                            + Order Frame
                                                        </button>

                                                        <button type="button"
                                                            onclick="addInvoiceItemRow('custom','lens')">
                                                            + Order Lens
                                                        </button>

                                                        <button type="button"
                                                            onclick="addInvoiceItemRow('custom','repairs')">
                                                            + Repairs
                                                        </button>

                                                        <button type="button"
                                                            onclick="addInvoiceItemRow('custom','other')">
                                                            + Custom Other
                                                        </button>

                                                    </div>-->

                                                </div>



                                            </div>

                                            <div class="row amount-row">
                                                <div class="amount">
                                                    <label for="amount">Total Amount:</label>
                                                    <input type="text" id="amount" name="amount" readonly>
                                                </div>
                                                <div class="paid">
                                                    <label for="paid">Paid Amount:</label>
                                                    <input type="text" id="paid" name="paid">
                                                </div>
                                                <div class="remaining_amount">
                                                    <label for="remaining_amount">Remaining Amount:</label>
                                                    <input type="text" id="remaining_amount" name="remaining_amount">
                                                </div>
                                            </div>

                                            <div class="row seller-row">
                                                <div class="seller">
                                                    <label for="seller">Seller:</label>
                                                    <input type="text" id="seller" name="seller">
                                                </div>
                                                <div class="pickup_date">
                                                    <label for="pickup_date">Pickup Date:</label>
                                                    <input type="date" id="pickup_date" name="pickup_date">
                                                </div>
                                                <!--<div class="transposition">
                                                    <label for="transposition">Need transposition?</label>
                                                    <select id="transposition" name="transposition">
                                                        <option value="0">No</option>
                                                        <option value="1">Yes</option>
                                                    </select>
                                                </div>-->
                                            </div>
                                            <div class="row notes-row">
                                                <div class="notes">
                                                    <label for="notes">notes:</label>
                                                    <textarea name="notes" id="notes"></textarea>
                                                </div>
                                            </div>
                                            <div class="prescription_table_input">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th rowspan="2"></th>
                                                            <th colspan="3">R</th>
                                                            <th rowspan="2">I.P.D</th>
                                                            <th colspan="3">L</th>
                                                        </tr>
                                                        <tr>
                                                            <th>SPH.</th>
                                                            <th>CYL.</th>
                                                            <th>AX.</th>
                                                            <th>SPH.</th>
                                                            <th>CYL.</th>
                                                            <th>AX.</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td><input type="checkbox" id="D-checkbox" name="d-checkbox" onchange="toggleInputs('D')"> D</td>
                                                            <td><input type="text" name="D_R_SPH" class="D-input small-input" disabled></td>
                                                            <td><input type="text" name="D_R_CYL" class="D-input small-input" disabled></td>
                                                            <td><input type="text" name="D_R_AX" class="D-input small-input" disabled></td>
                                                            <td><input type="text" name="D_IPD" class="D-input small-input" disabled></td>
                                                            <td><input type="text" name="D_L_SPH" class="D-input small-input" disabled></td>
                                                            <td><input type="text" name="D_L_CYL" class="D-input small-input" disabled></td>
                                                            <td><input type="text" name="D_L_AX" class="D-input small-input" disabled></td>
                                                        </tr>
                                                        <tr>
                                                            <td><input type="checkbox" id="R-checkbox" name="r-checkbox" onchange="toggleInputs('R')"> R</td>
                                                            <td><input type="text" name="R_R_SPH" class="R-input small-input" disabled></td>
                                                            <td><input type="text" name="R_R_CYL" class="R-input small-input" disabled></td>
                                                            <td><input type="text" name="R_R_AX" class="R-input small-input" disabled></td>
                                                            <td><input type="text" name="R_IPD" class="R-input small-input" disabled></td>
                                                            <td><input type="text" name="R_L_SPH" class="R-input small-input" disabled></td>
                                                            <td><input type="text" name="R_L_CYL" class="R-input small-input" disabled></td>
                                                            <td><input type="text" name="R_L_AX" class="R-input small-input" disabled></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <button type="submit">Submit</button>
                                        </form>
                                    </div>    
                    `;

            toggleSearchCustomerFields();

            document.getElementById("paid").addEventListener("input", calculateRemainingAmount);

            document.querySelector("#customer_search_type").addEventListener("change", toggleSearchCustomerFields);
            const createInvoiceForm = document.querySelector("#create_invoice_form");

            createInvoiceForm.addEventListener("submit", (event) => {

                event.preventDefault();

                // customer type

                const customerType = document.getElementById("customer_search_type").value;

                let customerId = null;

                if (customerType === "existing") {

                    const customerInput =
                        document.getElementById(
                            "search_client_input"
                        ).value;

                    const options =
                        document.querySelectorAll(
                            "#clients_List option"
                        );

                    options.forEach(option => {

                        if (option.value === customerInput) {

                            customerId =
                                option.dataset.id;

                        }

                    });

                }

                // invoice items

                const items = [];


                document.querySelectorAll("#invoice_items_body tr").forEach(item => {

                    const itemSource = item.querySelector(".item_source").value;
                    const quantity = item.querySelector(".product_quantity")?.value;
                    const price = item.querySelector(".product_price")?.value;
                    const subtotal = item.querySelector(".product_subtotal")?.value;

                    let type = null;
                    if (itemSource === "inventory") {
                        type = item.querySelector(".inventory_category_select")?.value;
                    } else if (itemSource === "order") {
                        type = item.querySelector(".order_category_select")?.value;
                    } else if (itemSource === "custom") {
                        type = item.querySelector(".custom_type_select")?.value;
                    }

                    const itemData = { type, item_source: itemSource, quantity, price, subtotal };

                    if (itemSource === "inventory" && type === "frame") {
                        itemData.product_id = item.querySelector(".inventory_product_select")?.value || item.querySelector(".lens_select")?.value || null;
                        itemData.frame_category = item.querySelector(".frame_category")?.value;
                        itemData.frame_name = item.querySelector(".inventory_product_select")?.selectedOptions[0]?.text;
                    } else if (itemSource === "inventory" && type === "lens") {
                        itemData.product_id = item.querySelector(".lens_select")?.value;
                        itemData.lens_name = item.querySelector(".lens_select")?.selectedOptions[0]?.text;
                    } else if (itemSource === "inventory") {
                        itemData.product_id = item.querySelector(".inventory_product_select")?.value || item.querySelector(".lens_select")?.value || null;
                    } else {
                        itemData.item_name = item.querySelector(".item_name")?.value;
                        itemData.category = item.querySelector(".td_category")?.textContent?.trim();
                        if (type === "lens" || type === "contact_lens") {
                            itemData.lens_sphere = item.querySelector(".lens_sphere")?.value;
                            itemData.lens_cylinder = item.querySelector(".lens_cylinder")?.value;
                        }
                    }

                    items.push(itemData);
                });
                // document
                //     .querySelectorAll("#invoice_items_body tr")
                //     .forEach(item => {

                //         const type =
                //             item.querySelector(".product_type").value;

                //         const quantity =
                //             item.querySelector(".product_quantity").value;

                //         const price =
                //             item.querySelector(".product_price").value;

                //         const subtotal =
                //             item.querySelector(".product_subtotal").value;

                //         const itemData = {

                //             type,
                //             quantity,
                //             price,
                //             subtotal

                //         };


                //         // FRAME   

                //         if (type === "frame") {
                //             const productSelect = item.querySelector(".inventory_product_select");
                //             if (productSelect) itemData.product_id = productSelect.value;

                //             const itemSource = item.querySelector(".item_source").value;
                //             itemData.item_source = itemSource;

                //             itemData.frame_category =
                //                 item.querySelector(".frame_category").value;

                //             itemData.frame_name =
                //                 item.querySelector(".frame_name").value;

                //         }

                //    
                //         // LENS
                //    

                //         else if (type === "lens") {

                //             itemData.lens_name =
                //                 item.querySelector(".lens_name").value;

                //             itemData.lens_usage =
                //                 item.querySelector(".lens_usage").value;

                //         }

                //    
                //         // OTHER
                //    

                //         else if (type === "other") {

                //             itemData.other_item_name =
                //                 item.querySelector(".other_item_name").value;

                //         }

                //         items.push(itemData);

                //     });
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                // final object
                const dataToSend = {

                    customer_type: customerType,

                    customer_id: customerId,

                    name:
                        document.getElementById("name").value,

                    phone_no:
                        document.getElementById("phone").value,

                    seller:
                        document.getElementById("seller").value,

                    amount:
                        document.getElementById("amount").value,

                    paid:
                        document.getElementById("paid").value,

                    remaining_amount:
                        document.getElementById(
                            "remaining_amount"
                        ).value,

                    pickup_date:
                        document.getElementById(
                            "pickup_date"
                        ).value,

                    notes:
                        document.getElementById("notes").value,

                    // Till now
                    payment_method: "cash",

                    prescription: getPrescriptionData(),

                    // prescription: {
                    //     has_prescription:
                    //         document.getElementById("D-checkbox").checked
                    //         ||
                    //         document.getElementById("R-checkbox").checked,

                    //     prescription_type:
                    //         document.getElementById("D-checkbox").checked
                    //             ? "d"
                    //             : "r",

                    //     right_sphere:
                    //         document.querySelector('[name="D_R_SPH"]')?.value
                    //         ||
                    //         document.querySelector('[name="R_R_SPH"]')?.value,

                    //     right_cylinder:
                    //         document.querySelector('[name="D_R_CYL"]')?.value
                    //         ||
                    //         document.querySelector('[name="R_R_CYL"]')?.value,

                    //     right_axis:
                    //         document.querySelector('[name="D_R_AX"]')?.value
                    //         ||
                    //         document.querySelector('[name="R_R_AX"]')?.value,

                    //     left_sphere:
                    //         document.querySelector('[name="D_L_SPH"]')?.value
                    //         ||
                    //         document.querySelector('[name="R_L_SPH"]')?.value,

                    //     left_cylinder:
                    //         document.querySelector('[name="D_L_CYL"]')?.value
                    //         ||
                    //         document.querySelector('[name="R_L_CYL"]')?.value,

                    //     left_axis:
                    //         document.querySelector('[name="D_L_AX"]')?.value
                    //         ||
                    //         document.querySelector('[name="R_L_AX"]')?.value,

                    //     ipd:
                    //         document.querySelector('[name="D_IPD"]')?.value
                    //         ||
                    //         document.querySelector('[name="R_IPD"]')?.value,

                    //     // Till now
                    //     notes: "",
                    // },

                    // prescription: null,

                    products: items

                };

                // console.log(dataToSend);

                // fetch

                fetch('/invoice/create', {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        'X-CSRFToken': csrfToken
                    },

                    body: JSON.stringify(dataToSend)

                })
                    .then(response => response.json())
                    .then(data => {

                        // console.log(data);

                        if (data.error) {

                            alert(data.error);
                            return;

                        }

                        alert("Invoice created successfully!");

                        showInvoicePrint(data.invoice);

                    })
                    .catch(error => console.error("Error:", error));

            });
            //     createInvoiceForm.addEventListener("submit", (event) => {

            //         event.preventDefault();

            //         const formData = new FormData(createInvoiceForm);

            //         fetch('/invoice/create', {
            //             method: "POST",
            //             headers: {
            //                 "Content-Type": "application/json"
            //             },
            //             body: JSON.stringify(formData)
            //         })
            //             .then(response => response.json())
            //             .then(data => {

            //                 console.log(data);

            //                 alert("Invoice created successfully!");

            //                 // redirect to dashboard
            //                 // userDashboard();

            //                 // Redirect to print (working)
            //                 showInvoicePrint(data.invoice);

            //             })
            //             .catch(error => console.error("Error:", error));

            //     });
            //     // function toggleInputs(row) {
            //     //     let inputs = document.querySelectorAll(`.${row}-input`);
            //     //     let checkbox = document.getElementById(`${row}-checkbox`);
            //     //     inputs.forEach(input => {
            //     //         input.disabled = !checkbox.checked;
            //     //         if (!checkbox.checked) input.value = "";
            //     //     });
            //     // }
            // })
            // .catch(error => console.error('Error:', error));


        })
};

function SearchInvoice(event) {

    const indexContainer = document.querySelector(".index_container");

    indexContainer.innerHTML = "";


    indexContainer.innerHTML = `
                            <div class="search-form-container">
                                <form class="search_form">
                                    <label for="search_type">Search By:</label>
                                    <select id="search_invoice_by" onchange="toggleSearchInvoiceFields()">
                                        <option value="id">Invoice id</option>
                                        <option value="details">Client name and Phone</option>
                                    </select>
                                    
                                    <!-- Search by Client Name -->
                                    <div class="search_by_id">
                                        <label for="invoice_id">Invoice ID:</label>
                                        <input type="text" class="search_input" id="invoice_id" name="invoice_id" required>
                                    </div>

                                    <!-- Search by Customer Name and Phone Number -->
                                    <div class="search_by_details">
                                        <label for="customer_name">Customer Name:</label>
                                        <input type="text" class="search_input" id="customer_name" name="customer_name" required>
                                        
                                        <label for="phone_number">Phone Number:</label>
                                        <input type="text" class="search_input" id="phone_number" name="phone_number" required>
                                    </div>

                                    <button id="search_btn" type="submit">Search</button>
                                </form>

                                <div id="search_results"></div>
                            </div>
    `;

    // default toggle
    toggleSearchInvoiceFields();

    document.getElementById("search_invoice_by").addEventListener("change", toggleSearchInvoiceFields);

    // const indexContainer = document.querySelector(".index_container");


    document.getElementById("search_btn").addEventListener("click", (event) => {

        event.preventDefault();

        const searchType = document.getElementById("search_invoice_by").value;
        let url = "/invoice/search?";

        if (searchType === "id") {
            const invoiceId = document.getElementById("invoice_id").value.trim();
            if (!invoiceId) { alert("Enter invoice ID"); return; }
            url += `invoice_id=${invoiceId}`;
        } else {
            const name = document.getElementById("customer_name").value.trim();
            const phone = document.getElementById("phone_number").value.trim();
            if (!name && !phone) { alert("Enter name and phone"); return; }
            // if (!name || !phone) { alert("Enter name and phone"); return; }
            const params = [];
            if (name) params.push(`customer_name=${encodeURIComponent(name)}`);
            if (phone) params.push(`phone_number=${encodeURIComponent(phone)}`);
            url += params.join("&");

            // url += `customer_name=${name}&phone_number=${phone}`;
        }

        // indexContainer.innerHTML = ``;

        // fetch('/search_invoice?')
        fetch(url)
            .then(response => response.json())
            .then(data => {

                // console.log(`SEARCH INVOICE RESULTS: ${results}!`);

                const results = document.getElementById("search_results");
                const invoices = data.result_invoices;
                if (!invoices || invoices.length === 0) {
                    results.innerHTML = "<p>No invoices found.</p>";
                    return;
                }

                results.innerHTML = invoices.map(invoice => `
                    <div class="invoice_result_card" data-id="${invoice.id}" style="cursor:pointer;">
                        <p><strong>#${invoice.id}</strong> — ${invoice.customer__full_name}</p>
                        <p>Phone: ${invoice.customer__phone}</p>
                        <p>Total: ${invoice.total_price} EGP</p>
                        <p>Paid: ${invoice.paid_amount} EGP</p>
                        <p>Remaining: ${invoice.remaining_amount} EGP</p>

                        <p>Date: ${new Date(invoice.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </div>
                `).join("");

                document.querySelectorAll(".invoice_result_card").forEach(card => {
                    card.addEventListener("click", () => {
                        const invoiceId = card.dataset.id;
                        const invoice = invoices.find(i => i.id == invoiceId);
                        showInvoicePrint(invoice);
                    });
                });
            })
            .catch(error => console.error('Error:', error));
    });

}

