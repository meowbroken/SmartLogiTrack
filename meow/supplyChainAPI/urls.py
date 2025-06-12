from django.urls import path
from supplyChainAPI.views import RegisterView, LoginView, InventoryCreateView, InventoryDetailView, OrderCreateView, OrderDetailView, SupplierDetailView, SuppliersCreateView, ForecastCreateView, ForecastDetailView

urlpatterns =[
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
  
    
]