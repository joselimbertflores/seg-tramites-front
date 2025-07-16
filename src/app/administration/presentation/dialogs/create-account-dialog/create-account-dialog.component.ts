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
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, forkJoin, of } from 'rxjs';

import { selectOption, SelectSearchComponent } from '../../../../shared';
import { AccountService } from '../../services';
import { Officer } from '../../../domain';
import { UserService } from '../../../../users/presentation/services';

@Component({
  selector: 'app-create-account-dialog',
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
  templateUrl: './create-account-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private accountService = inject(AccountService);
  // private pdfService = inject(PdfService);
  private dialogRef = inject(MatDialogRef);
  private userService = inject(UserService);

  officers = signal<selectOption<Officer>[]>([]);
  hidePassword = true;

  formAccount: FormGroup = this.formBuilder.nonNullable.group({
    officer: ['', Validators.required],
    dependency: ['', Validators.required],
    jobtitle: ['', Validators.required],
    isVisible: [true, Validators.required],
  });

  userForm: FormGroup = this.formBuilder.nonNullable.group({
    fullname: ['', Validators.required],
    login: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
    role: ['', Validators.required],
    isActive: [true, Validators.required],
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

  ngOnInit(): void {}

  save() {
    this.accountService
      .create(this.userForm.value, this.formAccount.value)
      .subscribe((account) => {
        // this.pdfService.createAccountSheet(
        //   account,
        //   this.formAccount.get('login')?.value,
        //   this.formAccount.get('password')?.value
        // );
        // TODO generate pdf user
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
    this.formAccount.patchValue({ officer: officer.id });
    this.selectedOfficer.set(officer);
    const credentials = this.userService.generateCredentials({
      firstName: officer.nombre,
      paternalLastName: officer.paterno,
      maternalLastName: officer.materno,
      dni: officer.dni,
    });
    this.userForm.patchValue({
      fullname: officer.fullname,
      officer: officer.id,
      login: credentials.login,
      password: credentials.password,
    });
  }

  unlink(): void {
    this.formAccount.get('officer')?.setValue(null);
    this.selectedOfficer.set(null);
  }

  get isFormValid() {
    return this.formAccount.valid && this.userForm.valid;
  }


}
