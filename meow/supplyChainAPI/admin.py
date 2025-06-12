from django.contrib import admin
from .models import Order, Supplier, Inventory, Forecast

admin.site.register(Order)
admin.site.register(Supplier)
admin.site.register(Inventory)
admin.site.register(Forecast)