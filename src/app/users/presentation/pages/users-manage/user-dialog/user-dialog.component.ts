import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../../services';

@Component({
    selector: 'app-user-dialog',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        MatSelectModule,
        MatCheckboxModule,
        MatFormFieldModule,
    ],
    templateUrl: './user-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);

  data = inject(MAT_DIALOG_DATA);

  hidePassword: boolean = true;
  formUser: FormGroup = this.formBuilder.group({
    fullname: ['', Validators.required],
    login: ['', Validators.required],
    password: ['', Validators.required],
    role: ['', Validators.required],
    isActive: [true, Validators.required],
  });
  roles = signal<any[]>([]);

  ngOnInit(): void {
    if (this.data) {
      this.formUser.patchValue(this.data);
      this.formUser.get('password')?.removeValidators([Validators.required]);
    }
    this.userService.getRoles().subscribe((roles) => {
      this.roles.set(roles);
    });
  }

  save() {
    const subscription = this.data
      ? this.userService.update(this.data._id, this.formUser.value)
      : this.userService.create(this.formUser.value);
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }
}
