import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { SearchInputComponent } from '../../../../shared';
import { ProjectEditor } from '../../dialogs';
import { ProjectDataSource } from '../../services';
import { RouterLink } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
@Component({
  selector: 'app-project-management',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    SearchInputComponent,
    MatMenuModule,
    RouterLink,
    MatFormFieldModule
],
  templateUrl: './project-management.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectManagement {
  private dialogRef = inject(MatDialog);
  private projectDataSource = inject(ProjectDataSource);

  dataSource = signal<any[]>([]);
  displayedColumns: string[] = [
    'code',
    'mode',
    'reference',
    'createdAt',
    'view',
    'options',
  ];

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.projectDataSource.findAll().subscribe((data) => {
      console.log(data);
      this.dataSource.set(data.projects);
      // this.datasize.set(data.length);
    });
  }

  create() {
    const dialogRef = this.dialogRef.open(ProjectEditor, {
      maxWidth: '1200px',
      width: '1200px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.dataSource.update((values) => [result, ...values]);
    });
  }

  update(procedure: any) {
    //   const dialogRef = this.dialog.open(ProcurementDialogComponent, {
    //     maxWidth: '1200px',
    //     width: '1200px',
    //     data: procedure,
    //   });
    //   dialogRef.afterClosed().subscribe((result: ProcurementProcedure) => {
    //     if (!result) return;
    //     this.dataSource.update((values) => {
    //       const index = values.findIndex(({ id: _id }) => _id === procedure.id);
    //       values[index] = result;
    //       return [...values];
    //     });
    //   });
  }

  // send(procedure: any) {
  // const data: submissionData = {
  //   procedure: {
  //     id: procedure.id,
  //     code: procedure.code,
  //   },
  //   attachmentsCount: procedure.numberOfDocuments,
  //   cite: procedure.cite,
  //   isOriginal: true,
  //   mode: 'initiate',
  // };
  // const dialogRef = this.dialog.open(SubmissionDialogComponent, {
  //   maxWidth: '1100px',
  //   width: '1100px',
  //   data,
  // });
  // dialogRef.afterClosed().subscribe((result) => {
  //   if (!result) return;
  //   this.datasource.update((values) => {
  //     const index = values.findIndex(({ id: _id }) => _id === procedure.id);
  //     values[index].state = procedureState.Revision;
  //     return [...values];
  //   });
  // });
}
