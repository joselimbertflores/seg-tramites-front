import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
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

import { forkJoin } from 'rxjs';


import {
  ServerSelectOption,
  ServerSelectSearchComponent,
  SimpleSelectOption,
  SimpleSelectSearchComponent,
} from '../../../../../shared';
import { AccountService } from '../../../services';
import { Officer } from '../../../../domain';

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
        SimpleSelectSearchComponent,
        ServerSelectSearchComponent,
    ],
    templateUrl: './create-account-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateAccountDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private accountService = inject(AccountService);
  // private pdfService = inject(PdfService);
  private dialogRef = inject(MatDialogRef<CreateAccountDialogComponent>);

  institutions = signal<SimpleSelectOption<string>[]>([]);
  dependencies = signal<ServerSelectOption<string>[]>([]);
  officers = signal<ServerSelectOption<Officer>[]>([]);
  roles = signal<SimpleSelectOption<string>[]>([]);
  hidePassword = true;

  formAccount: FormGroup = this.formBuilder.nonNullable.group({
    officer: ['', Validators.required],
    dependency: ['', Validators.required],
    jobtitle: ['', Validators.required],
    isVisible: [true, Validators.required],
  });

  formUser: FormGroup = this.formBuilder.nonNullable.group({
    fullname: ['', Validators.required],
    login: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
    role: ['', Validators.required],
    isActive: [true, Validators.required],
  });

  ngOnInit(): void {
    this._getRequiredProps();
  }

  save() {
    this.accountService
      .create(this.formUser.value, this.formAccount.value)
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
    this.accountService
      .searchOfficersWithoutAccount(term)
      .subscribe((officers) => {
        const options = officers.map((officer) => ({
          text: `${officer.fullname}`,
          value: officer,
        }));
        this.officers.set(options);
      });
  }

  onSelectInstitution(id: string): void {
    this.dependencies.set([]);
    this.accountService.getDependenciesOfInstitution(id).subscribe((data) => {
      const options = data.map(({ _id, nombre }) => ({
        value: _id,
        text: nombre,
      }));
      this.dependencies.set(options);
    });
  }

  onSelectOfficer(officer: Officer): void {
    const { login, password } = officer.generateCredentials();
    this.formUser.patchValue({
      fullname: officer.fullname,
      officer: officer.id,
      login,
      password,
    });
    this.formAccount.patchValue({ officer: officer.id });
  }

  get isFormValid() {
    return this.formAccount.valid && this.formUser.valid;
  }

  private _getRequiredProps(): void {
    forkJoin([
      this.accountService.getInstitutions(),
      this.accountService.getRoles(),
    ]).subscribe(([inst, roles]) => {
      this.institutions.set(
        inst.map(({ _id, nombre }) => ({ value: _id, text: nombre }))
      );
      this.roles.set(
        roles.map(({ _id, name }) => ({ value: _id, text: name }))
      );
    });
  }
}
