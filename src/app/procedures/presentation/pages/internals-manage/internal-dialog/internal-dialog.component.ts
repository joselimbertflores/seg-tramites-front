import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import {
  AutocompleteComponent,
  AutocompleteOption,
  SimpleSelectSearchComponent,
} from '../../../../../shared';
import { InternalService, ProfileService } from '../../../services';
import { Account } from '../../../../../administration/domain';
import { InternalProcedure } from '../../../../domain';

interface workers {
  emitter: AutocompleteOption<Account>[];
  receiver: AutocompleteOption<Account>[];
}
@Component({
    selector: 'app-internal-dialog',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        AutocompleteComponent,
        SimpleSelectSearchComponent,
    ],
    templateUrl: './internal-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InternalDialogComponent {
  private account = inject(ProfileService).account();
  private internalService = inject(InternalService);
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<InternalDialogComponent>);

  public data: InternalProcedure = inject(MAT_DIALOG_DATA);

  officers = signal<workers>({ emitter: [], receiver: [] });
  formProcedure: FormGroup = this.formBuilder.nonNullable.group({
    type: ['', Validators.required],
    numberOfDocuments: ['', Validators.required],
    segment: ['', Validators.required],
    reference: ['', Validators.required],
    cite: [this.account?.dependencia.codigo],
    emitter: this.formBuilder.group({
      fullname: [this.account?.officer?.fullname, Validators.required],
      jobtitle: [this.account?.jobtitle, Validators.required],
    }),
    receiver: this.formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
  });

  ngOnInit(): void {
    if (this.data) {
      this._loadFormData();
    } else {
      this._getRequiredProps();
    }
  }

  save() {
    const observable = this.data
      ? this.internalService.update(this.data._id, this.formProcedure.value)
      : this.internalService.create(this.formProcedure.value);
    observable.subscribe((procedure) => this.dialogRef.close(procedure));
  }

  searchAccounts(worker: 'emitter' | 'receiver', term: string): void {
    this.formProcedure.get(`${worker}.fullname`)?.setValue(term);
    if (!term) return;
    this.internalService.searchAccounts(term).subscribe((data) => {
      const options: AutocompleteOption<Account>[] = data.map((el) => ({
        text: el.officer?.fullname ?? 'Desvinculado',
        value: el,
      }));
      this.officers.update((values) => ({ ...values, [worker]: options }));
    });
  }

  selectAcount(worker: 'emitter' | 'receiver', account: Account): void {
    this.formProcedure.get(`${worker}`)?.patchValue({
      fullname: account.officer?.fullname,
      jobtitle: account.jobtitle,
    });
  }

  private _loadFormData() {
    this.formProcedure.removeControl('type');
    this.formProcedure.removeControl('segment');
    this.formProcedure.patchValue(this.data);
  }

  private _getRequiredProps() {
    this.internalService.getTypesProcedures().subscribe((data) => {
      this.formProcedure.get('type')?.setValue(data[0]?._id);
      this.formProcedure.get('segment')?.setValue(data[0]?.segmento);
    });
  }
}
