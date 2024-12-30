import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { filter, switchMap } from 'rxjs';

import {
  ServerSelectOption,
  SimpleSelectOption,
  ServerSelectSearchComponent,
  SimpleSelectSearchComponent,
  AlertService,
} from '../../../../../shared';

import {
  AccountService,
  PdfService,
  ReportService,
} from '../../../../../presentation/services';
import { Account, Officer } from '../../../../domain';
import { CustomValidators } from '../../../../../../helpers';

@Component({
  selector: 'app-update-account-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatStepperModule,
    ServerSelectSearchComponent,
    SimpleSelectSearchComponent,
  ],
  templateUrl: './update-account-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAccountDialogComponent {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UpdateAccountDialogComponent>);
  private alertService = inject(AlertService);
  private accountService = inject(AccountService);
  private reportService = inject(ReportService);
  private pdfService = inject(PdfService);

  data = signal(inject<Account>(MAT_DIALOG_DATA));
  officers = signal<ServerSelectOption<Officer>[]>([]);
  roles = signal<SimpleSelectOption<string>[]>([]);

  // Current officer full name
  fullname = signal<string | null>(null);
  hidePassword = true;

  formUser: FormGroup = this.formBuilder.group({
    fullname: [''],
    password: [''],
    login: ['', [Validators.required, CustomValidators.login]],
    role: ['', Validators.required],
    isActive: [true],
  });

  formAccount = this.formBuilder.group({
    jobtitle: ['', Validators.required],
    officer: [''],
    isVisible: [true],
  });

  ngOnInit(): void {
    this._getRequiredProps();
    this._loadForm();
    // TODO get inbox details
  }

  save() {
    const updateTask = this.accountService.edit(
      this.data()._id,
      this.formUser.value,
      this.formAccount.value
    );
    const subscription =
      this.formAccount.get('officer')?.value === null && this.data().officer
        ? this.alertService
            .confirmDialog({
              title: '¿Desvincular Funcionario?',
              description: `${this.data().officer?.fullname} sera desvinculado`,
            })
            .pipe(
              filter((result) => result),
              switchMap(() => updateTask)
            )
        : updateTask;
    subscription.subscribe((account) => {
      // TODO generate account sheet
      this.dialogRef.close(account);
    });
  }

  unlink(): void {
    this.formAccount.get('officer')?.setValue(null);
    this.fullname.set(null);
  }

  searchOfficer(text: string) {
    this.accountService.searchOfficersWithoutAccount(text).subscribe((data) => {
      const options = data.map((officer) => ({
        value: officer,
        text: officer.fullname,
      }));
      this.officers.set(options);
    });
  }

  onSelectOfficer(officer: Officer): void {
    const { login, password } = officer.generateCredentials();
    this.fullname.set(officer.fullname);
    this.formAccount.patchValue({ officer: officer._id });
    this.formUser.patchValue({
      fullname: officer.fullname,
      login,
      password,
    });
  }

  get isFormValid() {
    return this.formAccount.valid && this.formUser.valid;
  }

  private _loadForm(): void {
    const { user, officer, ...props } = this.data();
    this.formUser.patchValue(user);
    this.formAccount.patchValue({ ...props, officer: officer?._id });
    this.fullname.set(officer?.fullname ?? null);
  }

  private _getRequiredProps(): void {
    this.accountService.getRoles().subscribe((roles) => {
      this.roles.set(
        roles.map(({ _id, name }) => ({ value: _id, text: name }))
      );
    });
  }
}
