import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
  import { of } from 'rxjs';
  
interface Supplier {
  id: number;
  name: string;
  contact_info: string;
  average_lead_time: number;
  orders: number[];
}

interface Order {
  id: number;
  order_type: string;
  product: number;
  product_name: string;
  quantity: number;
  date_created: string;
  status: string;
  supplier: any;
  supplier_name: string;
}

@Component({
  standalone: false,
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css'] 
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  orderDetails: { [key: number]: Order } = {};
  baseUrl: string = 'http://127.0.0.1:8000/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getSuppliers();
  }

  
  getSuppliers() {
    this.http.get<Supplier[]>(`${this.baseUrl}/supplier/`)
      .pipe(
        catchError((error) => {
          console.error('Error loading suppliers:', error);
          return of([]);
        })
      )
      .subscribe(
        (res: Supplier[]) => {
          this.suppliers = res;
          console.log('Suppliers loaded:', this.suppliers);
        }
      );
  }


  getOrderDetails(orderId: number) {
    if (this.orderDetails[orderId]) {
      delete this.orderDetails[orderId];
    } else {
      this.http.get<Order>(`${this.baseUrl}/order/${orderId}/`).subscribe(
        (res: Order) => {
          this.orderDetails[orderId] = res;
        },
        (error) => {
          console.error(`Error loading details for order ${orderId}:`, error);
        }
      );
    }
  }
}