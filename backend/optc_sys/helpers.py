from .models import InvoiceItem

def get_invoice_items(invoice_id):
    items = InvoiceItem.objects.filter(invoice_id=invoice_id).select_related(
        "product", "order_item", "order_lens"
    )
    result = []
    for item in items:
        entry = {
            "id": item.id,
            "item_type": item.item_type,
            "item_source": item.item_source,
            "item_name": item.item_name,
            "category": item.category,
            "quantity": item.quantity,
            "price": str(item.price),
            "subtotal": str(item.subtotal),
        }
        if hasattr(item, "order_item"):
            entry["order_details"] = {
                "item_color": item.order_item.item_color,
                "supplier": item.order_item.supplier,
                "is_received": item.order_item.is_received,
            }
        if hasattr(item, "order_lens"):
            entry["order_lens_details"] = {
                "sphere": item.order_lens.sphere,
                "cylinder": item.order_lens.cylinder,
                "lens_usage": item.order_lens.lens_usage,
                "lens_color": item.order_lens.lens_color,
                "supplier": item.order_lens.supplier,
                "is_received": item.order_lens.is_received,
            }
        result.append(entry)
    return result