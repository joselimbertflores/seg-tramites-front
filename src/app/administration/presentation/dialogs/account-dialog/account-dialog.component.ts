import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, of } from 'rxjs';

import {
  SelectSearchOption,
  SelectSearchComponent,
  ToastService,
} from '../../../../shared';
import { Account, Officer } from '../../../domain';
import { AccountService } from '../../services';

@Component({
  selector: 'app-account-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatStepperModule,
    MatCheckboxModule,
    MatFormFieldModule,
    SelectSearchComponent,
  ],
  templateUrl: './account-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDialogComponent {
  private dialogRef = inject(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);

  data = inject<Account | undefined>(MAT_DIALOG_DATA);

  accountForm: FormGroup = this.formBuilder.nonNullable.group({
    dependencyId: ['', Validators.required],
    officerId: ['', Validators.required],
    jobtitle: ['', Validators.required],
    employmentType: [null],
    isVisible: [true, Validators.required],
  });

  userForm: FormGroup = this.formBuilder.nonNullable.group({
    login: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9._-]+$'),
      ],
    ],
    isActive: [true, Validators.required],
    role: ['', Validators.required],
  });

  selectedInstitution = signal<string | null>(null);
  selectedOfficer = signal<Officer | null>(null);
  roles = toSignal(this.accountService.getRoles(), { initialValue: [] });
  officers = signal<SelectSearchOption<Officer>[]>([]);
  institutions = toSignal(this.accountService.getInstitutions(), {
    initialValue: [],
  });
  dependencies = resource({
    params: () => ({ institution: this.selectedInstitution() }),
    loader: ({ params }) =>
      firstValueFrom(
        params.institution
          ? this.accountService.getDependencies(params.institution)
          : of([])
      ),
  });

  employmentTypes = ['ITEM', 'CONTRATO', 'OTROS'];

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

    subcription.subscribe(({ account, mail }) => {
      if (mail) {
        this.toastService.showToast({
          title: this.data ? 'Cuenta actualizada' : 'Cuenta creada',
          description: mail.message,
          severity: mail.ok ? 'success' : 'warning',
          duration: 14000,
        });
      }
      this.dialogRef.close(account);
    });
  }

  searchOfficer(term: string): void {
    this.accountService
      .searchOfficersWithoutAccount(term)
      .subscribe((options) => {
        this.officers.set(options);
      });
  }

  onSelectOfficer(officer: Officer): void {
    const login = this.generarLogin(officer);
    this.accountForm.patchValue({ officerId: officer.id });
    this.userForm.patchValue({ login, isActive: true });
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
    const { user, officer, jobtitle, isVisible, employmentType } = this.data;

    this.selectedOfficer.set(officer ?? null);
    this.accountForm.patchValue({
      isVisible,
      jobtitle,
      officerId: officer?.id,
      employmentType,
    });
    this.userForm.patchValue(user);
  }

  get isFormValid() {
    return this.accountForm.valid && this.userForm.valid;
  }

  private generarLogin({ fullName, dni }: Officer): string {
    const nameParts = this.normalizeText(fullName.trim().toLowerCase()).split(
      /\s+/
    );

    const firstNameInitial = nameParts[0]?.charAt(0) || '';

    let lastName = '';
    if (nameParts.length >= 3) {
      lastName = nameParts[nameParts.length - 2];
    } else if (nameParts.length >= 2) {
      lastName = nameParts[1];
    }
    return `${firstNameInitial}${lastName}`.toUpperCase();
  }

  private normalizeText(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
