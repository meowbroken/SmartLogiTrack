import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orderForm!: FormGroup;
  orders: any[] = [];
  pendingOrders: any[] = [];
  fulfilledIncomingOrders: any[] = [];
  fulfilledOutgoingOrders: any[] = [];
  products: any[] = [];
  suppliers: any[] = [];
  errorMessage: string = '';
  isEditMode: boolean = false;
  editingOrderId: number | null = null;

  orderTypes = [
    { value: 'INCOMING', label: 'Incoming' },
    { value: 'OUTGOING', label: 'Outgoing' }
  ];

  statusChoices = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'FULLFILLED', label: 'Fulfilled' }
  ];

  private apiUrl = 'http://127.0.0.1:8000/order/';
  private productUrl = 'http://127.0.0.1:8000/inventory/';
  private supplierUrl = 'http://127.0.0.1:8000/supplier/';

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.orderForm = this.fb.group({
      order_type: ['', Validators.required],
      product: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      status: ['', Validators.required],
      supplier: ['', Validators.required]
    });
  }

  private loadInitialData(): void {
    this.loadOrders();
    this.loadProducts();
    this.loadSuppliers();
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
    });
  }

  loadOrders(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.orders = data;
        this.pendingOrders = data.filter(order => order.status === 'PENDING');
        this.fulfilledIncomingOrders = data.filter(
          order => order.status === 'FULLFILLED' && order.order_type === 'INCOMING'
        );
        this.fulfilledOutgoingOrders = data.filter(
          order => order.status === 'FULLFILLED' && order.order_type === 'OUTGOING'
        );
      },
      error: (err) => this.handleError('Failed to load orders.', err)
    });
  }

  loadProducts(): void {
    this.http.get<any[]>(this.productUrl).subscribe({
      next: (data) => (this.products = data),
      error: (err) => this.handleError('Failed to load products.', err)
    });
  }

  loadSuppliers(): void {
    this.http.get<any[]>(this.supplierUrl).subscribe({
      next: (data) => (this.suppliers = data),
      error: (err) => this.handleError('Failed to load suppliers.', err)
    });
  }

  editOrder(order: any): void {
    this.isEditMode = true;
    this.editingOrderId = order.id;
    this.orderForm.patchValue({
      order_type: order.order_type,
      product: order.product,
      quantity: order.quantity,
      status: order.status,
      supplier: order.supplier
    });
  }

  updateOrder(): void {
    if (this.orderForm.invalid || this.editingOrderId === null) {
      return;
    }

    this.http.put(`${this.apiUrl}${this.editingOrderId}/`, this.orderForm.value).subscribe({
      next: () => {
        this.snackBar.open('Order updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadOrders();
        this.resetForm();
      },
      error: (err) => this.handleError('Failed to update the order.', err)
    });
  }

  createOrder(): void {
    if (this.orderForm.invalid) {
      return;
    }

    this.http.post(this.apiUrl, this.orderForm.value).subscribe({
      next: () => {
        this.snackBar.open('Order created successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadOrders();
        this.resetForm();
      },
      error: (err) => this.handleError('Failed to create order. Please try again.', err)
    });
  }

  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.http.delete(`${this.apiUrl}${orderId}/`).subscribe({
        next: () => {
          this.snackBar.open('Order deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
                horizontalPosition: 'center',
          verticalPosition: 'top'
          });
          this.loadOrders();
        },
        error: (err) => this.handleError('Failed to delete the order. Please try again.', err)
      });
    }
  }

  resetForm(): void {
    this.orderForm.reset();
    this.isEditMode = false;
    this.editingOrderId = null;
  }
}