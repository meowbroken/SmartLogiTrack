"""
URL configuration for meow project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from supplyChainAPI.views import InventoryCreateView, InventoryDetailView, OrderCreateView, OrderDetailView, SupplierDetailView, SuppliersCreateView, ForecastCreateView, ForecastDetailView, ForecastPredictionView, SupplierPartnerOrderReceiver, InquiryEmailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('supplyChainAPI.urls')),
    path('inventory/', InventoryCreateView.as_view(), name='create-inventory'),
    path('inventory/<int:pk>/', InventoryDetailView.as_view(), name='get-inventory'),
    path('order/', OrderCreateView.as_view(), name='create-order'),
    path('order/<int:pk>/', OrderDetailView.as_view(), name='get-order'),
    path('supplier/', SuppliersCreateView.as_view(), name='create-supplier'),
    path('supplier/<int:pk>/', SupplierDetailView.as_view(), name='get-supplier'),
    path('forecast/', ForecastCreateView.as_view(), name='create-forecast'),
    path('forecast/<int:pk>/', ForecastDetailView.as_view(), name='get-forecast'),
    path('forecast/predict/', ForecastPredictionView.as_view(), name='forecast-predict'),
    path('supplier-partner/order/receive/', SupplierPartnerOrderReceiver.as_view(), name='supplier-partner-order-receive'),
    path('inquire/', InquiryEmailView.as_view(), name='inquiry-email'),

]
