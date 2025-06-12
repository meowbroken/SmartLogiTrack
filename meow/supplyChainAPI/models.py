from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser

class Inventory(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name

class Supplier(models.Model):
     name = models.CharField(max_length=255)
     contact_info = models.CharField(max_length=255)
     average_lead_time = models.IntegerField()

     def __str__(self):
          return self.name


class Order(models.Model):
    ORDER_TYPES = [('INCOMING', 'Incoming'), ('OUTGOING', 'Outgoing')]
    STATUS_CHOICES = [('PENDING', 'Pending'), ('FULLFILLED', 'Fullfilled')]

    order_type = models.CharField(choices=ORDER_TYPES, max_length=10)
    product = models.ForeignKey(Inventory, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, related_name='orders', on_delete=models.CASCADE)
    quantity = models.IntegerField()
    date_created = models.DateTimeField(auto_now_add=True)
    status = models.CharField(choices=STATUS_CHOICES, max_length=10)
  
    
class Forecast(models.Model):
     inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE)
     predicted_demand = models.IntegerField()
     suggested_reorder_quantity = models.IntegerField()
     forecast_date = models.DateTimeField(auto_now_add=True)

class ChatInteraction(models.Model):
    customer_input = models.TextField()
    staff_reply = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)




