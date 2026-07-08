from django.contrib import admin
from .models import Product, Invoice, InvoiceItem, Prescription, Customer, LensDetails, OrderItem, OrderLens

# Register your models here.

# Register your models here.

admin.site.register(Product)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)
admin.site.register(Prescription)
admin.site.register(Customer)
admin.site.register(LensDetails)
admin.site.register(OrderItem)
admin.site.register(OrderLens)
