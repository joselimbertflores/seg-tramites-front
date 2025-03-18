import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { MaterialModule } from '../../../../material.module';

interface dependents {
  id: string;
  officer?: {
    fullname: string;
    jobtitle: string;
  };
  pendings: number;
}
@Component({
    selector: 'app-report-dependents',
    imports: [CommonModule, MaterialModule],
    templateUrl: './report-dependents.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportDependentsComponent implements OnInit {
  // private reportService = inject(ReportService);
  // private accout = inject(AuthService).user();

  displayedColumns: string[] = [
    'officer',
    'pending',
    'received',
    'rejected',
    'completed',
    'archived',
  ];
  dataSource = signal<any[]>([]);
  ngOnInit(): void {
    // if(!this.accout?.id_dependency) return
    // this.reportService.getPendingsByUnit(this.accout!.id_dependency).subscribe((data) => {
    //   this.dataSource.set(data);
    // });
  }


}
