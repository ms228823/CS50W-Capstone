from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("invoice/create", views.create_invoice, name="create_invoice"),
    path("invoice/data", views.invoice_form_data, name="invoice_form_data"),
    path("invoice/search", views.search_invoice, name="search_invoice"),
    path("dashboard", views.admin_dashboard, name="admin_dashboard"),
]