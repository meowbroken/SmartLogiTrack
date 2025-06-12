from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from .serializers import (
    RegistrationSerializer, 
    InventorySerializer, 
    OrderSerializer, 
    SupplierSerializer, 
    ForecastSerializer,
    ChatInteractionSerializer
)
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from .models import Order, Inventory, Supplier, Forecast, ChatInteraction
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
from scipy.stats import zscore
from django.db.models import Sum
import pandas as pd
from .utils.utils.order_extractor import extract_order_details_unstructured

from textblob import TextBlob
from rest_framework.decorators import api_view, permission_classes
from django.db import transaction
import re

@api_view(['POST'])
def feedback_sentiment_view(request):
    """
    Responds to customer feedback:
    - If feedback asks for order details or tracking by order ID, returns order info.
    - If feedback is a review, responds based on sentiment.

    Expects JSON:
      - "feedback": "your feedback text"

    Returns JSON:
      - "sentiment": "positive"/"negative"/"neutral"/"info"/"not_found"
      - "polarity": float
      - "response": string (auto-generated reply)

    Sample Inputs:
    {
      "feedback": "Can you track order 123?"
    }
    {
      "feedback": "Thank you, your service was excellent!"
    }
    {
      "feedback": "I'm not happy with my last order."
    }
    {
      "feedback": "track order 9999"
    }
    """
    feedback = request.data.get("feedback", "")

    if not feedback:
        return Response({"error": "Feedback text is required."}, status=400)

  
    similar = ChatInteraction.objects.filter(
        customer_input__iexact=feedback, 
        resolved=True,
        staff_reply__isnull=False
    ).order_by('-created_at').first()

    if similar:
        return Response({
            "response": similar.staff_reply,
            "learned": True,
            "interaction_id": similar.id
        }, status=200)

    order_id_match = re.search(r'order(?:\s*id)?\D*(\d+)', feedback, re.IGNORECASE)
    if order_id_match:
        order_id = order_id_match.group(1)
        try:
            order = Order.objects.get(id=order_id)
            order_details = {
                "order_id": order.id,
                "status": order.status,
                "product": str(order.product),
                "quantity": order.quantity,
            }
            response_text = (
                f"Order {order.id} details:\n"
                f"Status: {order.status}\n"
                f"Product: {order_details['product']}\n"
                f"Quantity: {order.quantity}"
            )
            sentiment = "info"
            polarity = 0.0
        except Order.DoesNotExist:
            response_text = f"Sorry, we could not find an order with ID {order_id}."
            sentiment = "not_found"
            polarity = 0.0
        return Response({
            "response": response_text,
            "sentiment": sentiment,
            "polarity": polarity
        }, status=200)

    blob = TextBlob(feedback)
    polarity = blob.sentiment.polarity
    if polarity > 0.2:
        sentiment = "positive"
        response_text = "Thank you for your positive feedback! We're glad you had a great experience."
        return Response({
            "response": response_text,
            "sentiment": sentiment,
            "polarity": polarity
        }, status=200)
    elif polarity < -0.2:
        sentiment = "negative"
        response_text = "We're sorry to hear about your experience. A staff member will assist you shortly."
        interaction = ChatInteraction.objects.create(customer_input=feedback)
        return Response({
            "response": response_text,
            "sentiment": sentiment,
            "needs_staff": True,
            "interaction_id": interaction.id,
            "polarity": polarity
        }, status=200)
    else:
        sentiment = "neutral"
        response_text = "Thank you for your feedback. If you have any suggestions, please let us know!"
        return Response({
            "response": response_text,
            "sentiment": sentiment,
            "polarity": polarity
        }, status=200)



class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("Request Data:", request.data)
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_staff = False
            user.is_superuser = False
            user.save()
            token, _ = Token.objects.get_or_create(user=user)
            role = 'admin' if user.is_staff else 'user'
            return Response({"token": token.key, "role": role}, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            role = 'admin' if user.is_staff else 'user'
            return Response({
                'token': token.key,
                'role': role
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)


class ForecastPredictionView(APIView):
    def get(self, request):
        """
        Handles GET requests to generate and return forecast data for products.
        """
        orders = Order.objects.values('date_created', 'product__name').annotate(total=Sum('quantity'))
        print("Orders Query Result:", orders)
        if not orders:
            return Response({"detail": "No order data available."}, status=status.HTTP_404_NOT_FOUND)

        df = pd.DataFrame(orders)
        forecast_entries = []

        for product in df['product__name'].unique():
            product_df = df[df['product__name'] == product][['date_created', 'total']]
            product_df = product_df.rename(columns={'date_created': 'ds', 'total': 'y'})
            product_df['ds'] = pd.to_datetime(product_df['ds']).dt.tz_localize(None)

            print(f"Product: {product}, Historical Data:\n{product_df}")

            if len(product_df) < 2:
                print(f"Skipping product {product} due to insufficient data.")
                continue

            product_df = product_df[product_df['y'].between(product_df['y'].quantile(0.05), product_df['y'].quantile(0.95))]

            if (product_df['y'] < 0).any():
                print(f"Skipping product {product} due to negative values in historical data.")
                continue

            if len(product_df) < 2:
                print(f"Skipping product {product} after filtering due to insufficient data.")
                continue

            try:
                model = Prophet(yearly_seasonality=True, weekly_seasonality=True)
                model.fit(product_df)

                future = model.make_future_dataframe(periods=7)
                forecast = model.predict(future)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(7)

                print(f"Product: {product}, Forecast:\n{forecast}")

                for _, forecast_row in forecast.iterrows():
                    forecast_entries.append({
                        'product': product,
                        'date': forecast_row['ds'].strftime('%Y-%m-%d'),
                        'predicted': round(forecast_row['yhat'], 2),
                        'lower': round(forecast_row['yhat_lower'], 2),
                        'upper': round(forecast_row['yhat_upper'], 2),
                    })
            except Exception as e:
                print(f"Error processing product {product}: {e}")
                continue

        return Response(forecast_entries, status=status.HTTP_200_OK)


class InventoryCreateView(generics.ListCreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer


class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer


class OrderCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        print("Request Data:", request.data)  # Debugging: Print request data
        response = super().create(request, *args, **kwargs)
        print("Response Data:", response.data)  # Debugging: Print response data
        return response


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class SuppliersCreateView(generics.ListCreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class ForecastCreateView(generics.ListCreateAPIView):
    queryset = Forecast.objects.all()
    serializer_class = ForecastSerializer

    def post(self, request, *args, **kwargs):
        print("Request Data:", request.data)
        return super().post(request, *args, **kwargs)


class ForecastDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Forecast.objects.all()
    serializer_class = ForecastSerializer


class SupplierPartnerOrderReceiver(APIView):
    """
    Expected final payload after override:
    {
        "product": 2,
        "quantity": 606,
        "supplier_id": 2,      <-- provided by the client
        "order_type": "INCOMING",   --> assigned automatically
        "status": "PENDING"         --> assigned automatically
    }
    """
    permission_classes = []

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'supplier_id' in data:
            data['supplier'] = data.pop('supplier_id')
        
        data['order_type'] = 'INCOMING'
        data['status'] = 'PENDING'
        
        serializer = OrderSerializer(data=data)
        if serializer.is_valid():
            order = serializer.save()
            response_data = {
                "status": "success",
                "message": "Order received successfully.",
                "data": serializer.data
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            response_data = {
                "status": "error",
                "message": "Order creation failed.",
                "errors": serializer.errors
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)



class InquiryEmailView(APIView):
    """
    Endpoint to process an inquiry email.
    
    Expects a JSON payload with:
      - "from": the raw sender data (email_from)
      - "text": the full email body
      
    It uses the extraction logic to extract details (product and quantity) and stores an Order with:
      - order_type: "INCOMING"
      - status: "PENDING"
    """
    def post(self, request, *args, **kwargs):
        supplier_from = request.data.get("from", "").strip()  # raw sender
        email_text = request.data.get("text", "").strip()       # full email body
        
        if not supplier_from or not email_text:
            return Response(
                {"error": "Both 'from' and 'text' fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        extracted_details = extract_order_details_unstructured(email_text)
        if "inventory" not in extracted_details or "quantity" not in extracted_details:
            return Response(
                {"error": "Unable to extract required order details (product and quantity) from the text."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        supplier_obj = Supplier.objects.filter(name__iexact=supplier_from).first()
        if not supplier_obj:
            supplier_obj = Supplier.objects.create(
                name=supplier_from,
                contact_info="",
                average_lead_time=0
            )
        
        inventory_name = extracted_details["inventory"]
        try:
            inventory_obj = Inventory.objects.get(name__iexact=inventory_name)
        except Inventory.DoesNotExist:
            return Response(
                {"error": f"Inventory item '{inventory_name}' not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            with transaction.atomic():
                order = Order.objects.create(
                    product=inventory_obj,
                    quantity=extracted_details["quantity"],
                    supplier=supplier_obj,
                    order_type="INCOMING",
                    status="PENDING"
                )
        except Exception as e:
            return Response(
                {"error": f"Failed to create order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            "status": "success",
            "message": "Order created successfully from inquiry.",
            "order_id": order.id,
            "product": inventory_obj.name,
            "quantity": order.quantity,
            "supplier": supplier_obj.name
        }, status=status.HTTP_201_CREATED)


class UnansweredChatListView(generics.ListAPIView):
    queryset = ChatInteraction.objects.filter(resolved=False)
    serializer_class = ChatInteractionSerializer

class ChatInteractionReplyView(generics.UpdateAPIView):
    queryset = ChatInteraction.objects.all()
    serializer_class = ChatInteractionSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        staff_reply = request.data.get("staff_reply", "")
        if not staff_reply:
            return Response({"error": "staff_reply is required."}, status=400)
        instance.staff_reply = staff_reply
        instance.resolved = True
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

@api_view(['G   ET'])
@permission_classes([AllowAny])  
def check_chat_reply(request, interaction_id):
 
    try:
        chat = ChatInteraction.objects.get(id=interaction_id)
        if chat.resolved and chat.staff_reply:
            return Response({"reply": chat.staff_reply}, status=200)
        else:
            return Response({"reply": None}, status=200)
    except ChatInteraction.DoesNotExist:
        return Response({"error": "Interaction not found."}, status=404)