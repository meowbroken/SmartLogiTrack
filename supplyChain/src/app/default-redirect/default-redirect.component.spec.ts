import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultRedirectComponent } from './default-redirect.component';

describe('DefaultRedirectComponent', () => {
  let component: DefaultRedirectComponent;
  let fixture: ComponentFixture<DefaultRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DefaultRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
