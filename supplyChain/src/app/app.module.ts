import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EntryComponent } from './entry/entry.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InventoryComponent } from './inventory/inventory.component';
import { OrdersComponent } from './orders/orders.component';
import { ForecastingComponent } from './forecasting/forecasting.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { DefaultRedirectComponent } from './default-redirect/default-redirect.component';
import { RegisterComponent } from './register/register.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { SidebarMainComponent } from './sidebarmain/sidebarmain.component';
import { AdminMessagesComponent } from './admin-messages/admin-messages.component'; // Import the new component
// Ensure to import the new component in the module
@NgModule({
  declarations: [
    AppComponent,
    EntryComponent,
    DashboardComponent,
    InventoryComponent,
    OrdersComponent,
    ForecastingComponent,
    AnalyticsComponent,
    SuppliersComponent,
    DefaultRedirectComponent,
    RegisterComponent,
    SidebarComponent,
    ChatbotComponent,
    SidebarMainComponent,
    AdminMessagesComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule, // Added here
    CommonModule,
    AppRoutingModule,   
    MatSnackBarModule,   // Added here for Material Snackbar
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
