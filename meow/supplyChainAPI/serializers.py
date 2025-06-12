from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Order, Supplier, Forecast, Inventory, ChatInteraction

User = get_user_model()

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user


class SupplierSerializer(serializers.ModelSerializer):
    orders = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,

    )

    class Meta:
        model = Supplier
        fields = '__all__'



class OrderSerializer(serializers.ModelSerializer):
    # For read operations, show the product name and supplier's name.
    product_name = serializers.CharField(source='product.name', read_only=True)
    supplier_name = serializers.ReadOnlyField(source='supplier.name', read_only=True)
    supplier_id = serializers.ReadOnlyField(source='supplier.id', read_only=True)
    # For write operations, allow assignment of a supplier via its id.

    # Use the nested supplier serializer for read-only representation.
  

    class Meta:
        model = Order
        fields = [
            'id',
            'order_type',
            'product',
            'product_name',
            'quantity',
            'date_created',
            'status',
            'supplier',       # nested supplier details (read-only)
            'supplier_name',  # shortcut to the supplier's name (read-only)
            'supplier_id'     # for write access (assignment by id)
        ]


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'


class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forecast
        fields = '__all__'


class ChatInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatInteraction
        fields = '__all__'