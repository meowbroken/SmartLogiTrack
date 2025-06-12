import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarMainComponent } from './sidebarmain.component';

describe('SidebarmainComponent', () => {
  let component: SidebarMainComponent;
  let fixture: ComponentFixture<SidebarMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
