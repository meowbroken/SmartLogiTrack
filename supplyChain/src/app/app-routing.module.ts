import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntryComponent } from './entry/entry.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DefaultRedirectComponent } from './default-redirect/default-redirect.component';
import { RegisterComponent } from './register/register.component';
import { ForecastingComponent } from './forecasting/forecasting.component';
import { OrdersComponent } from './orders/orders.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AdminMessagesComponent } from './admin-messages/admin-messages.component'; // Import the new component
const routes: Routes = [
  { path: 'login', component: EntryComponent },
  { path: 'dashboard', component:   DashboardComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forecast', component: ForecastingComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'suppliers', component: SuppliersComponent },
  { path: 'chatbot', component: ChatbotComponent },
  {path: 'admin-messages', component: AdminMessagesComponent}, // Assuming AdminMessagesComponent is similar to SuppliersComponent
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirect to login by default
  { path: '**', redirectTo: 'login', pathMatch: 'full' } // Handle unknown routes

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
