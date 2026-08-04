import { TestBed } from '@angular/core/testing';
import { KpiTileComponent } from './kpi-tile.component';

describe('KpiTileComponent', () => {
  it('renders label and value', () => {
    TestBed.configureTestingModule({ imports: [KpiTileComponent] });
    const fixture = TestBed.createComponent(KpiTileComponent);
    fixture.componentInstance.label = 'Model Accuracy';
    fixture.componentInstance.value = '96.7%';
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Model Accuracy');
    expect(text).toContain('96.7%');
  });
});
