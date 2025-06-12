import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebarmain',
  standalone: false,
  templateUrl: './sidebarmain.component.html',
  styleUrls: ['./sidebarmain.component.css']
})
export class SidebarMainComponent implements OnInit {
  isAdmin: boolean = false;

  ngOnInit() {
    const role = localStorage.getItem('role');
    this.isAdmin = role?.toLowerCase() === 'admin';
  }
}
