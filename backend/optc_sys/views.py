from datetime import date, datetime
import time
from django.utils import timezone

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

from django.db.models import Count, Sum, Max

from .models import (
    Product,
    Customer,
    Prescription,
    Invoice,
    InvoiceItem,
    LensDetails,
    OrderItem,
    OrderLens,
)

from .helpers import get_invoice_items

from django.utils.timezone import now
from django.contrib.auth.decorators import login_required
import json
from django.db import transaction


@transaction.atomic
def index(request):
    if request.user.is_authenticated:
        return render(request, "index.html")
    else:
        return redirect("login")

@login_required
@transaction.atomic
def admin_dashboard(request):

    logged_in_username = request.user.username

    total_products_count = Product.objects.all().count()

    total_products = list(
        Product.objects.all().values(
            "id",
            "name",
            "category",
            "barcode",
            "quantity",
            "purchase_price",
            "selling_price",
        )
    )

    total_customers = Customer.objects.all().count()

    # total_customers = Customer.objects.all().count()

    total_sales_today = list(
        Invoice.objects.filter(created_at__date=timezone.now().date()).values(
            "id", "customer__id", "customer__full_name", "created_at", "total_price"
        )
    )

    total_sales_count = Invoice.objects.all().count()

    total_sales = (
        Invoice.objects.aggregate(total_sales=Sum("total_price"))["total_sales"] or 0
    )

    # DEBUGGING PURPOSES ONLY REMOVE !!!!!!!!!!!!!!!!!!IMPORTANT
    Invoice.objects.all().update(created_at=timezone.now())

    # low_stock_count = Product.objects.filter(quantity__lte=5).count()
    low_stock_products = list(
        Product.objects.filter(quantity__lte=5).values(
            "id", "name", "category", "quantity", "selling_price"
        )
    )

    # top_10_products = list(SaleItem.objects.values('product__name').annotate(
    #     count=Count('product')
    # ).order_by('-count')[:10].values("sale__customer__id", "sale__customer__full_name", "sale__total_price", "product__id", "product__name", "quantity", "price"))
    top_10_products = list(
        InvoiceItem.objects.values(
            "invoice__customer__id",
            "invoice__customer__full_name",
            "invoice__total_price",
            "product__id",
            "product__name",
            "quantity",
            "price",
        ).order_by("-quantity")[:10]
    )

    return JsonResponse(
        {
            "logged_in_username": logged_in_username,
            "total_products_count": total_products_count,
            "total_products": total_products,
            "total_customers": total_customers,
            "total_sales": total_sales,
            "total_sales_count": total_sales_count,
            # "low_stock_products": low_stock_count,
            "low_stock_products": low_stock_products,
            "total_sales_today": total_sales_today,
            "top_10_products": top_10_products,
        },
        status=200,
    )


#########################################
# @csrf_exempt
@login_required
@transaction.atomic
def create_invoice(request):

    if request.method == "POST":

        # customer_name = request.POST.get("name")
        # phone_no = request.POST.get("phone_no")
        # total_amount = request.POST.get("amount")
        # payment_method = request.POST.get("payment_method")
        # notes = request.POST.get("notes")
        # pickup_date = request.POST.get("pickup_date")

        data = json.loads(request.body)

        # customer_id = data.get("customer_id")
        customer_type = data.get("customer_type")
        products = data.get("products")
        payment_method = data.get("payment_method")
        phone_no = data.get("phone_no")
        seller = data.get("seller")

        pickup_date = data.get("pickup_date")

        if pickup_date:
            pickup_date = datetime.strptime(pickup_date, "%Y-%m-%d")

            pickup_date = timezone.make_aware(pickup_date)
        # gotten_customer_by_id = Customer.objects.get(id=customer_id)

        if customer_type == "existing":

            customer_id = data.get("customer_id")

            try:
                customer = Customer.objects.get(id=customer_id)
            except Customer.DoesNotExist:
                return JsonResponse(
                    {"message": "Selected customer is not found in database!"},
                    status=404,
                )
            # if not customer:
            #     return JsonResponse(
            #         {"message": "Selected customer is not found in database!"},
            #         status=404,
            #     )

        elif customer_type == "new":
            new_customer_name = data.get("name")
            new_customer_phone = data.get("phone_no")
            new_customer_email = data.get("email", "")

            if not new_customer_name:
                return JsonResponse(
                    {"message": "New customer name required!"}, status=422
                )
            elif not new_customer_phone:
                return JsonResponse(
                    {"message": "New customer phone required!"}, status=422
                )

            customer = Customer.objects.create(
                full_name=new_customer_name,
                phone=new_customer_phone,
                email=new_customer_email,
            )

        else:
            return JsonResponse({"error": "Invalid customer type"}, status=400)

        # prescription part
        prescription = None
        prescription_data = data.get("prescription") or {}
        has_prescription = prescription_data.get("has_prescription")

        if prescription_data and has_prescription:
            try:
                prescription = Prescription.objects.create(
                    customer=customer,
                    prescription_type=prescription_data.get("prescription_type", "d"),
                    right_sphere=prescription_data.get("right_sphere") or 0,
                    right_cylinder=prescription_data.get("right_cylinder") or 0,
                    right_axis=prescription_data.get("right_axis") or 1,
                    left_sphere=prescription_data.get("left_sphere") or 0,
                    left_cylinder=prescription_data.get("left_cylinder") or 0,
                    left_axis=prescription_data.get("left_axis") or 1,
                    ipd=prescription_data.get("ipd") or 0,
                    notes=prescription_data.get("notes", ""),
                )
            except Exception as e:
                return JsonResponse(
                    {"error": f"Invalid prescription data: {e}"}, status=400
                )

        # invoice = Invoice.objects.create(
        #     customer=customer,
        #     payment_method=payment_method,
        #     created_by=request.user
        # )

        invoice = Invoice.objects.create(
            customer=customer,
            total_price=data.get("amount") or 0,
            paid_amount=data.get("paid") or 0,
            remaining_amount=data.get("remaining_amount") or 0,
            payment_method=data.get("payment_method"),
            pickup_date=pickup_date,
            notes=data.get("notes"),
            created_by=request.user,
            seller=seller,
            prescription=prescription,
        )

        total_price = 0

        for item in products:

            item_type = item.get("type")
            item_source = item.get("item_source")

            # quantity = int(item["quantity"])
            quantity = int(item.get("quantity", 1))
            price = float(item.get("price", 0))
            # subtotal = float(item.get("subtotal", 0))

            # subtotal = quantity * product.selling_price
            subtotal = quantity * price

            # inventory source
            if item_source == "inventory":

                # product = Product.objects.get(id=item["product_id"])

                product_id = item.get("product_id")

                if not product_id or product_id in ("undefined", "null", ""):
                    invoice.delete()
                    return JsonResponse(
                        {
                            "error": f"Missing product selection for item: {item.get('type') or 'unknown'}"
                        },
                        status=400,
                    )

                try:
                    product = Product.objects.get(id=product_id)
                except Product.DoesNotExist:
                    invoice.delete()
                    return JsonResponse(
                        {"error": f"Product with id {product_id} not found"}, status=404
                    )

                if product.quantity < quantity:

                    invoice.delete()

                    return JsonResponse(
                        {"error": f"Not enough stock for {product.name}"}, status=400
                    )

                # FRAME
                if item_type == "frame":
                    frame_name = item.get("frame_name")
                    frame_category = item.get("frame_category")
                    InvoiceItem.objects.create(
                        product=product,
                        invoice=invoice,
                        item_type="frame",
                        item_name=frame_name,
                        category=frame_category,
                        quantity=quantity,
                        price=price,
                        subtotal=subtotal,
                    )

                    # product.quantity -= quantity
                    # product.save()

                # LENS
                elif item_type == "lens":
                    lens_name = item.get("lens_name")
                    lens_usage = item.get("lens_usage")
                    InvoiceItem.objects.create(
                        product=product,
                        invoice=invoice,
                        item_type="lens",
                        item_name=lens_name,
                        category=lens_usage,
                        quantity=quantity,
                        price=price,
                        subtotal=subtotal,
                    )

                    # product.quantity -= quantity
                    # product.save()

                # OTHERS contact_lens / accessory sold as inventory
                else:
                    invoice_item = InvoiceItem.objects.create(
                        product=product,
                        invoice=invoice,
                        item_source="inventory",
                        item_type=item_type,
                        item_name=product.name,
                        quantity=quantity,
                        price=price,
                        subtotal=subtotal,
                    )
                # elif item_type == "other":
                #     other_item_name = item.get("other_item_name")
                #     InvoiceItem.objects.create(
                #         invoice=invoice,
                #         item_type="other",
                #         item_name=other_item_name,
                #         quantity=quantity,
                #         price=price,
                #         subtotal=subtotal,
                #     )

                # product.quantity -= quantity
                # product.save()

                product.quantity -= quantity
                product.save()

            elif item_source == "order":
                # print(f"Item type: {item_type}")
                invoice_item = InvoiceItem.objects.create(
                    invoice=invoice,
                    item_source="order",
                    # item_type=item_type,
                    item_type=(
                        item_type
                        if item_type in dict(InvoiceItem.ITEM_TYPE_CHOICES)
                        else "other"
                    ),
                    item_name=item.get("item_name"),
                    category=item.get("category", ""),
                    quantity=quantity,
                    price=price,
                    subtotal=subtotal,
                )

                if item_type in ("lens", "contact_lens"):
                    
                    if item_type == "contact_lens":
                        lens_type = "contact_lens"
                    else:
                        lens_type = "optical_lens"
                        
                    OrderLens.objects.create(
                        invoice_item=invoice_item,
                        lens_type= lens_type,
                        # lens_type= "optical_lens",
                        sphere=item.get("sphere") or None,
                        cylinder=item.get("cylinder") or None,
                        lens_usage=item.get("lens_usage", ""),
                        lens_color=item.get("lens_color", ""),
                        supplier=item.get("supplier", ""),
                        notes=item.get("notes", ""),
                    )
                else:
                    OrderItem.objects.create(
                        invoice_item=invoice_item,
                        item_type=item_type,
                        item_color=item.get("item_color", ""),
                        supplier=item.get("supplier", ""),
                        notes=item.get("notes", ""),
                    )

            # customary source
            else:
                item_name = item.get("item_name")
                category = item.get("category", "")
                InvoiceItem.objects.create(
                    invoice=invoice,
                    item_source=item_source,
                    item_type=item_type,
                    item_name=item_name,
                    category=category,
                    quantity=quantity,
                    price=price,
                    subtotal=subtotal,
                )

            # subtotal = quantity * product.selling_price

            # InvoiceItem.objects.create(
            #     sale=invoice,
            #     product=product,
            #     quantity=quantity,
            #     price=product.selling_price,
            #     subtotal=subtotal,
            # )

            total_price += subtotal

        invoice.total_price = total_price
        invoice.remaining_amount = total_price - float(invoice.paid_amount)
        invoice.save()

        # invoice_data_item_value = (
        #     "id",
        #     "item_type",
        #     "item_source",
        #     "item_name",
        #     "category",
        #     "quantity",
        #     "price",
        #     "subtotal",
        #     "paid_amount",
        #     "remaining_amount",
        #     "pickup_date",
        #     "order_item__item_color",
        #     "order_item__supplier",
        #     "order_item__notes",
        #     "order_item__is_received",
        #     "order_lens__lens_type",
        #     "order_lens__sphere",
        #     "order_lens__cylinder",
        #     "order_lens__lens_usage",
        #     "order_lens__lens_color",
        #     "order_lens__supplier",
        #     "order_lens__notes",
        #     "order_lens__is_received",
        # )

        invoice_data_item = (
            "id",
            "customer__full_name",
            "customer__phone",
            "payment_method",
            "notes",
            "created_at",
            "total_price",
            "paid_amount",
            "remaining_amount",
            "pickup_date",
            "prescription__right_sphere",
            "prescription__right_cylinder",
            "prescription__right_axis",
            "prescription__left_sphere",
            "prescription__left_cylinder",
            "prescription__left_axis",
            "prescription__ipd",
            "prescription__prescription_type",
            "prescription__notes",
        )

        invoice_data = (
            Invoice.objects.filter(id=invoice.id).values(*invoice_data_item).first()
        )

        invoice_data["customer__phone"] = str(invoice_data["customer__phone"])

        # invoice_data["items"] = list(
        #     InvoiceItem.objects.filter(invoice_id=invoice.id).values(
        #         *invoice_data_item_value
        #     )
        # )
        invoice_data["items"] = get_invoice_items(invoice.id)

        return JsonResponse(
            {
                "message": "Invoice created successfully!",
                "invoice_id": invoice.id,
                "invoice": invoice_data,
            },
            status=201,
        )

    return JsonResponse({"error": "Method not allowed"}, status=400)


@login_required
@transaction.atomic
def invoice_form_data(request):
    # invoices_count = Invoice.objects.count()

    # new_invoice_count = invoices_count + 1
    max_id_dict = Invoice.objects.aggregate(Max("id"))

    max_id = max_id_dict["id__max"]

    new_invoice_id = max_id + 1
    # customers_info = list(Customer.objects.all().values( "id", "full_name", str("phone"), "email" ))
    customers_info = []
    for customer in Customer.objects.all():
        customers_info.append(
            {
                "id": customer.id,
                "full_name": customer.full_name,
                "phone": str(customer.phone),
                "email": customer.email,
            }
        )

    # values = (
    #     "name",
    #     "category",
    #     "frame_category",
    #     "barcode",
    #     "quantity",
    #     "selling_price",
    # )

    products_values = (
        "id",
        "name",
        "category",
        "frame_category",
        "barcode",
        "quantity",
        "purchase_price",
        "selling_price",
    )

    # lens_values = (
    #     "product",
    #     "sphere",
    #     "cylinder",
    #     "lens_usage",
    #     "lens_color",
    # )

    lens_values = (
        "product",
        "sphere",
        "cylinder",
        "lens_usage",
        "lens_color",
        "product__name",
        "product__category",
        "product__barcode",
        "product__quantity",
        "product__purchase_price",
        "product__selling_price",
    )

    products_frame_list = list(
        Product.objects.filter(category="frame").values(*products_values)
    )

    products_lens_list = list(
        LensDetails.objects.filter(product__category="lens").values(*lens_values)
    )

    products_contact_lens_list = list(
        Product.objects.filter(category="contact_lens").values(*products_values)
    )

    products_accessory_list = list(
        Product.objects.filter(category="accessory").values(*products_values)
    )

    frame_categories = list(
        Product.objects.filter(category="frame", quantity__gt=0)
        .exclude(frame_category__isnull=True)
        .exclude(frame_category="")
        .values_list("frame_category", flat=True)
        .distinct()
    )

    return JsonResponse(
        {
            # "new_invoice_count": new_invoice_count,
            "new_invoice_count": new_invoice_id,
            "customers_info": customers_info,
            "products_lens_list": products_lens_list,
            "products_frame_list": products_frame_list,
            "products_accessory_list": products_accessory_list,
            "products_contact_lens_list": products_contact_lens_list,
            "frame_categories": frame_categories,
        }
    )


@csrf_exempt
@login_required
@transaction.atomic
def search_invoice(request):
    if request.method == "GET":
        invoice_id = request.GET.get("invoice_id")
        customer_name = request.GET.get("customer_name")
        phone_number = request.GET.get("phone_number")

        # fields = (
        #     "id",
        #     "customer__full_name",
        #     "customer__phone",
        #     "payment_method",
        #     "notes",
        #     "created_at",
        #     "total_price",
        #     "pickup_date",
        #     "seller",
        #     "notes",
        #     "prescription__right_sphere",
        #     "prescription__right_cylinder",
        #     "prescription__right_axis",
        #     "prescription__left_sphere",
        #     "prescription__left_cylinder",
        #     "prescription__left_axis",
        #     "prescription__ipd",
        #     "prescription__prescription_type",
        #     "prescription__notes",
        # )

        invoice_fields = (
            "id",
            "customer__full_name",
            "customer__phone",
            "payment_method",
            "notes",
            "created_at",
            "total_price",
            "paid_amount",
            "remaining_amount",
            "pickup_date",
            "seller",
            "notes",
            "prescription__right_sphere",
            "prescription__right_cylinder",
            "prescription__right_axis",
            "prescription__left_sphere",
            "prescription__left_cylinder",
            "prescription__left_axis",
            "prescription__ipd",
            "prescription__prescription_type",
            "prescription__notes",
        )

        if invoice_id:
            result_invoices = list(
                Invoice.objects.filter(id=invoice_id).values(*invoice_fields)
            )

            # return JsonResponse({"result_invoice":result_invoices})
        # elif customer_name and phone_number:
        elif customer_name or phone_number:

            filters = {}

            if customer_name:
                filters["customer__full_name__icontains"] = customer_name
            if phone_number:
                filters["customer__phone__icontains"] = phone_number

            result_invoices = list(Invoice.objects.filter(**filters).values(*invoice_fields))

            # result_invoices = list(
            #     Invoice.objects.filter(
            #         customer__full_name__icontains=customer_name,
            #         customer__phone=phone_number,
            #     ).values(*fields)
            # )
            # return JsonResponse({"result_invoice":result_invoices})
        else:
            return JsonResponse(
                {"error": "Provide invoice_id or customer_name + phone_number"},
                status=400,
            )

        for invoice in result_invoices:
            if invoice.get("customer__phone"):
                invoice["customer__phone"] = str(invoice["customer__phone"])
            invoice["items"] = get_invoice_items(invoice["id"])

        return JsonResponse({"result_invoices": result_invoices})


# @csrf_exempt
# def create_invoice(request):
# if request.method == "POST":

#     gotten_data = json.loads(request.body)

#     new_invoice = Product.objects.create(
#         name=gotten_data.get("name"),
#         category=gotten_data.get("category"),
#         barcode=gotten_data.get("barcode"),
#         quantity=gotten_data.get("quantity"),
#         purchase_price=gotten_data.get("purchase_price"),
#         selling_price=gotten_data.get("selling_price"),
#     )

#     return JsonResponse(
#         {"message": "Product created successfully!", "product_id": new_product.id},
#         status=201,
#     )

# invoices_count = Invoice.objects.count()

# new_invoice_count = invoices_count + 1

# return JsonResponse({"new_invoice_count": new_invoice_count})

# # return JsonResponse({"error": "Method not allowed!"}, status=400)
