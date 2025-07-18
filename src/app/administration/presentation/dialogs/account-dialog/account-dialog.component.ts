import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  resource,
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
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, of } from 'rxjs';

import { selectOption, SelectSearchComponent } from '../../../../shared';
import { UserService } from '../../../../users/presentation/services';
import { AccountService } from '../../services';
import { Account, Officer } from '../../../domain';

@Component({
  selector: 'app-account-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule,
    MatStepperModule,

    SelectSearchComponent,
  ],
  templateUrl: './account-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private accountService = inject(AccountService);
  // private pdfService = inject(PdfService);
  private dialogRef = inject(MatDialogRef);
  private userService = inject(UserService);

  data = inject<Account | undefined>(MAT_DIALOG_DATA);
  officers = signal<selectOption<Officer>[]>([]);
  hidePassword = true;

  accountForm: FormGroup = this.formBuilder.nonNullable.group({
    dependencyId: ['', Validators.required],
    officerId: ['', Validators.required],
    jobtitle: ['', Validators.required],
    isVisible: [true, Validators.required],
  });

  userForm: FormGroup = this.formBuilder.nonNullable.group({
    isActive: [true, Validators.required],
    role: ['', Validators.required],
  });

  roles = toSignal(this.accountService.getRoles(), { initialValue: [] });
  institutions = toSignal(this.accountService.getInstitutions(), {
    initialValue: [],
  });
  selectedInstitution = signal<string | null>(null);
  selectedDependency = signal<string | null>(null);

  selectedOfficer = signal<Officer | null>(null);

  dependencies = resource({
    params: () => ({ institution: this.selectedInstitution() }),
    loader: ({ params }) =>
      params.institution
        ? firstValueFrom(
            this.accountService.getDependencies(params.institution)
          )
        : firstValueFrom(of([])),
  });

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    const subcription = this.data
      ? this.accountService.update(
          this.data.id,
          this.userForm.value,
          this.accountForm.value
        )
      : this.accountService.create(this.userForm.value, this.accountForm.value);

    subcription.subscribe((account) => {
      this.dialogRef.close(account);
    });
  }

  searchOfficer(term: string): void {
    console.log(term);
    this.accountService
      .searchOfficersWithoutAccount(term)
      .subscribe((options) => {
        this.officers.set(options);
      });
  }

  onSelectInstitution(id: string): void {
    this.dependencies.set([]);
    // this.accountService.getDependenciesOfInstitution(id).subscribe((data) => {
    //   const options = data.map(({ _id, nombre }) => ({
    //     value: _id,
    //     text: nombre,
    //   }));
    //   this.dependencies.set(options);
    // });
  }

  onSelectOfficer(officer: Officer): void {
    this.accountForm.patchValue({ officerId: officer.id });
    this.selectedOfficer.set(officer);
  }

  unlink(): void {
    this.accountForm.get('officerId')?.setValue(null);
    this.selectedOfficer.set(null);
  }

  private loadForm(): void {
    if (!this.data) return;
    this.accountForm.removeControl('dependencyId');
    this.accountForm.get('officerId')?.removeValidators(Validators.required);
    const { user, officer, jobtitle, isVisible } = this.data;

    this.selectedOfficer.set(officer ?? null);
    this.accountForm.patchValue({
      isVisible,
      jobtitle,
      officerId: officer?.id,
    });
    console.log(user);
    this.userForm.patchValue({ isActive: user.isActive, role: user.role });
  }

  get isFormValid() {
    return this.accountForm.valid && this.userForm.valid;
  }
}
