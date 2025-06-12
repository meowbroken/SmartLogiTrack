import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Inventory {
  id?: number;
  name: string;
  description: string;
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
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'] // Optional: add CSS styling if needed
})
export class InventoryComponent implements OnInit {
  inventories: Inventory[] = [];
  newInventory: Inventory = { name: '', description: '' };

  // Adjust the API URL if needed
  private apiUrl = 'http://127.0.0.1:8000/inventory/';
  private ordersApiUrl = 'http://127.0.0.1:8000/order/';

  // Stores orders grouped by inventory id.
  // Each key holds an object containing two arrays: pending and fulfilled orders.
  inventoryOrders: { [inventoryId: number]: { pending: Order[]; fulfilled: Order[] } } = {};

  // Controls the toggle state of orders shown for a given inventory item.
  showOrders: { [inventoryId: number]: boolean } = {};

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getInventories();
  }

  // Fetch all inventory items.
  getInventories(): void {
    this.http.get<Inventory[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.inventories = data;
      },
      error: (err) => {
        console.error('Error fetching inventory items', err);
      }
    });
  }

  // Add a new inventory item.
  addInventory(): void {
    this.http.post<Inventory>(this.apiUrl, this.newInventory).subscribe({
      next: (createdItem) => {
        this.snackBar.open('Added successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });        this.inventories.push(createdItem);
        // Reset the form.
        this.newInventory = { name: '', description: '' };
      },
      error: (err) => {
        console.error('Error adding inventory item', err);
      }
    });
  }

  // Toggle orders for a specific inventory item.
  // When toggled on, fetch orders filtered by the inventory (product) ID and group them by status.
  toggleOrders(inventory: Inventory): void {
    if (this.showOrders[inventory.id!]) {
      // Hide orders if already visible.
      this.showOrders[inventory.id!] = false;
    } else {
      // Fetch orders for this inventory item via the orders endpoint.
      this.http.get<Order[]>(`${this.ordersApiUrl}?product=${inventory.id}`).subscribe({
        next: (orders) => {
          // Group orders based on their status.
          const pending = orders.filter(order => order.status === 'PENDING');
          const fulfilled = orders.filter(order => order.status === 'FULLFILLED');
          this.inventoryOrders[inventory.id!] = { pending, fulfilled };
          this.showOrders[inventory.id!] = true;
        },
        error: (err) => {
          console.error(`Error fetching orders for inventory ${inventory.id}`, err);
        }
      });
    }
  }
}