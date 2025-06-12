  import { Component, OnInit } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  interface Order {
    id: number;
    email_from: string;
    email_text: string;
    supplier: string;
    product: string;
    quantity: number;
    order_type: string;
    status: string;
    tracking?: string;
  }

  interface PickupRequest {
    dateTime: string;
    address: string;
    product: string;
    instructions?: string;
  }

  interface UserProfile {
    name: string;
    email: string;
  }

  @Component({
    selector: 'app-dashboard',
    standalone: false,
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
  })
  export class DashboardComponent implements OnInit {
    orders: Order[] = [];
    isAdmin: boolean = false;
    pickup: PickupRequest = { dateTime: '', address: '', product: '', instructions: '' };
    pickupRequests: PickupRequest[] = [];
    products: string[] = ['Woods', 'Glue', 'Nails']; // Example, replace with API data if needed
    notifications: string[] = [
      'Order #1234 delivered.',
      'Pickup request approved.',
      'Chat reply from logistics manager.'
    ];
    user: UserProfile = { name: 'Supplier User', email: 'supplier@example.com' };
    forecastSummary: { trend: string } | null = { trend: 'Stable demand expected' };

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
      const role = localStorage.getItem('role');
      this.isAdmin = role?.toLowerCase() === 'admin';
      this.loadOrders();
      // Optionally load products, notifications, user profile, etc. from API
    }

    loadOrders(): void {
      this.http.get<Order[]>('http://127.0.0.1:8000/order/')
        .subscribe(
          data => {
            this.orders = data;
          },
          error => {
            console.error('Failed to load orders', error); 
          }
        );
    }

    cancelOrder(order: Order): void {
      if (order.status !== 'PENDING') return;
      this.http.patch<Order>(`http://127.0.0.1:8000/order/${order.id}/`, { status: 'CANCELLED' })
        .subscribe(
          updatedOrder => {
            order.status = 'CANCELLED';
          },
          error => {
            console.error('Failed to cancel order', error);
          }
        );
    }

    markFulfilled(order: Order): void {
      if (order.status !== 'PENDING') return;
      this.http.patch<Order>(`http://127.0.0.1:8000/order/${order.id}/`, { status: 'FULFILLED' })
        .subscribe(
          updatedOrder => {
            order.status = 'FULFILLED';
          },
          error => {
            console.error('Failed to mark as fulfilled', error);
          }
        );
    }

    downloadInvoice(order: Order): void {

      alert(`Downloading invoice for order #${order.id}`);
    }

    downloadReceipt(order: Order): void {

      alert(`Downloading delivery receipt for order #${order.id}`);
    }

    submitPickupRequest(): void {

      this.pickupRequests.push({ ...this.pickup });
      this.pickup = { dateTime: '', address: '', product: '', instructions: '' };
      this.notifications.unshift('Pickup request submitted.');
    }

    downloadDocument(type: string): void {
  
      alert(`Downloading ${type}`);
    }

    uploadDocument(event: any): void {
    
      const file = event.target.files[0];
      if (file) {
        alert(`Uploading document: ${file.name}`);
      }
    }

    editProfile(): void {

      alert('Profile editing not implemented.');
    }
  }