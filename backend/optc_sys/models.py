from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import timedelta
from django.utils import timezone

# Create your models here.

def get_five_days_from_now_at_eight_pm():
    """
    Calculates the datetime 5 days from now,
    and sets the time strictly to 20:00 (8:00 PM).
    """

    future_dt = timezone.now() + timedelta(days=5)

    return future_dt.replace(hour=20, minute=0, second=0, microsecond=0)


# Create your models here.
class Product(models.Model):
    CATEGORY_CHOICES = [
        ("frame", "Frame"),
        ("lens", "Lens"),
        ("contact_lens", "Contact Lens"),
        ("accessory", "Accessory"),
    ]
    
    FRAME_CATEGORY_CHOICES = [
        ("medical", "Medical"),
        ("sunglasses", "Sunglasses"),
    ]

    name = models.CharField(max_length=300)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    frame_category = models.CharField(
        max_length=50, choices=FRAME_CATEGORY_CHOICES, blank=True, null=True
    )
    barcode = models.CharField(max_length=50, unique=True)
    quantity = models.PositiveIntegerField(default=0)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return (
            f"#{self.id} | "
            f"{self.name} | "
            f"{self.category} | "
            f"Qty: {self.quantity}"
        )


class LensDetails(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="lens")
    # name = models.CharField(max_length=300)
    sphere = models.DecimalField(max_digits=4, decimal_places=2)
    cylinder = models.DecimalField(max_digits=4, decimal_places=2)

    # not used
    lens_usage = models.CharField(max_length=255, blank=True, null=True)

    lens_color = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return (
            f"LensDetails #{self.id} | "
            f"{self.product.name} | "
            f"SPH: {self.sphere} | "
            f"CYL: {self.cylinder} | "
            f"Usage: {self.lens_usage or 'N/A'} | "
            f"Color: {self.lens_color or 'N/A'}"
        )


class Customer(models.Model):
    full_name = models.CharField(max_length=300)
    phone = PhoneNumberField(null=False, blank=False, unique=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return f"{self.id}, {self.full_name}, {self.phone}, {self.email}"


class Prescription(models.Model):
    PRESCRIPTION_TYPE_CHOICE = [("r", "Reading"), ("d", "Distance")]

    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="prescriptions"
    )

    prescription_type = models.CharField(
        max_length=30, default="need categorization", choices=PRESCRIPTION_TYPE_CHOICE
    )

    right_sphere = models.DecimalField(max_digits=4, decimal_places=2)
    right_cylinder = models.DecimalField(max_digits=4, decimal_places=2)
    right_axis = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(180)]
    )

    left_sphere = models.DecimalField(max_digits=4, decimal_places=2)
    left_cylinder = models.DecimalField(max_digits=4, decimal_places=2)
    left_axis = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(180)]
    )

    ipd = models.DecimalField(max_digits=4, decimal_places=1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id}, {self.customer}, {self.right_sphere}, {self.right_cylinder}, {self.right_axis}, {self.left_sphere}, {self.left_cylinder}, {self.left_axis}, {self.ipd}"


class Invoice(models.Model):

    PAYMENT_CHOICES = [
        ("cash", "Cash"),
        ("visa", "Visa"),
        ("instapay", "Instapay"),
    ]
    customer = models.ForeignKey(
        Customer, on_delete=models.SET_NULL, null=True, blank=True
    )
    payment_method = models.CharField(
        max_length=50, choices=PAYMENT_CHOICES, default="cash"
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remaining_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True
    )

    seller = models.CharField(max_length=50, null=True, blank=True)

    # pickup date (default five days from now at eight pm by function)
    pickup_date = models.DateTimeField(default=get_five_days_from_now_at_eight_pm)

    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )

    def __str__(self):
        return f"{self.id}, {self.customer}, {self.created_at}, {self.total_price}"


class InvoiceItem(models.Model):
    ITEM_SOURCE_CHOICES = [
        ("inventory", "Inventory"),
        ("order", "Order"),
        ("custom", "Custom"),
    ]

    ITEM_TYPE_CHOICES = [
        ("frame", "Frame"),
        ("lens", "Lens"),
        ("repairs", "Repairs"),
        ("other", "Other"),
        ("contact_lens", "Contact Lens"),
        ("accessory", "Accessory"),
    ]

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="sale", null=True, blank=True
    )
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    item_name = models.CharField(
        max_length=255, default="need name", blank=True, null=True
    )
    
    
    item_source = models.CharField(
        max_length=20, choices=ITEM_SOURCE_CHOICES, default="custom"
    )

    # item_source = models.CharField(max_length=20, default="custom", blank=True, null=True)

    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    
    # item_type = models.CharField(max_length=20, blank=True, null=True)

    category = models.CharField(max_length=255, blank=True, null=True)

    # pickup date (default five days from now at eight pm by function)
    pickup_date = models.DateTimeField(default=get_five_days_from_now_at_eight_pm)

    def __str__(self):
        return (
            f"{self.id}, {self.invoice}, {self.product}, {self.quantity}, {self.price}"
        )


class OrderItem(models.Model):

    invoice_item = models.OneToOneField(
        InvoiceItem, on_delete=models.CASCADE, related_name="order_item"
    )

    item_type = models.CharField(max_length=100, blank=True, null=True)

    # edited from admin dashboard
    item_color = models.CharField(max_length=100, blank=True, null=True)
    
    # edited from admin dashboard
    supplier = models.CharField(max_length=255, blank=True, null=True)

    notes = models.TextField(blank=True)

    # edited from admin dashboard
    is_received = models.BooleanField(default=False)

    ordered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):

        return f"OrderItem #{self.id} | " f"{self.invoice_item.item_name}"


class OrderLens(models.Model):

    LENS_TYPE_CHOICES = [
        ("optical_lens", "Optical Lens"),
        ("contact_lens", "Contact Lens"),
    ]

    invoice_item = models.OneToOneField(
        InvoiceItem, on_delete=models.CASCADE, related_name="order_lens"
    )

    lens_type = models.CharField(max_length=30, choices=LENS_TYPE_CHOICES)
    
    # lens_type = models.CharField(max_length=30, default="need specification!", blank=True, null=True)

    sphere = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)

    cylinder = models.DecimalField(
        max_digits=4, decimal_places=2, blank=True, null=True
    )

    # no axis in order
    # axis = models.IntegerField(
    #     blank=True,
    #     null=True
    # )

    lens_usage = models.CharField(max_length=255, blank=True, null=True)

    # edited from admin dashboard
    lens_color = models.CharField(max_length=255, blank=True, null=True)

    # edited from admin dashboard
    supplier = models.CharField(max_length=255, blank=True, null=True)

    # edited from admin dashboard
    notes = models.TextField(blank=True)

    # edited from admin dashboard
    is_received = models.BooleanField(default=False)

    ordered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):

        return f"OrderLens #{self.id} | " f"{self.invoice_item.item_name}"
