import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
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
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs';

import { systemResource } from '../../../domain';
import { role } from '../../../infrastructure';
import { RoleService } from '../../services';

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CdkAccordionModule,
    MatCheckboxModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class RoleDialogComponent {
  private dialogRef = inject(MatDialogRef);
  private roleService = inject(RoleService);

  data = inject<role | undefined>(MAT_DIALOG_DATA);
  name = new FormControl(this.data?.name ?? '', {
    nonNullable: true,
    validators: Validators.required,
  });
  resources = signal<systemResource[]>([]);
  hasPermissions = computed(() =>
    this.resources().some(({ actions }) =>
      actions.some(({ isSelected }) => isSelected)
    )
  );

  ngOnInit() {
    this.loadSystemResources();
  }

  save(): void {
    const subscription = this.data
      ? this.roleService.update(
          this.data._id,
          this.name.value,
          this.resources()
        )
      : this.roleService.create(this.name.value, this.resources());
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  toggleAll(index: number, checked: boolean) {
    this.resources.update((items) => {
      items[index].isSelected = checked;
      items[index].actions = items[index].actions.map((action) => ({
        ...action,
        isSelected: checked,
      }));
      return [...items];
    });
  }

  updateCheckItem(checked: boolean, index: number, subindex: number) {
    this.resources.update((items) => {
      items[index].actions[subindex].isSelected = checked;
      items[index].isSelected = items[index].actions.every(
        ({ isSelected }) => isSelected
      );
      return [...items];
    });
  }

  someComplete(item: systemResource): boolean {
    const selected = item.actions.filter((action) => action.isSelected).length;
    return selected > 0 && selected < item.actions.length;
  }

  private loadSystemResources(): void {
    this.roleService
      .getSystemResources()
      .pipe(
        map((resp) =>
          resp.map(({ actions, ...props }) => ({
            ...props,
            actions: actions.map((action) => ({
              ...action,
              isSelected: false,
            })),
            isSelected: false,
          }))
        )
      )
      .subscribe((resources) => {
        const checkedResources = this.data
          ? resources.map((item) => {
              const hasPermission = this.data?.permissions.find(
                ({ resource }) => resource === item.value
              );
              if (!hasPermission) return item;
              const checkedActions = item.actions.map((action) => ({
                ...action,
                isSelected: hasPermission.actions.includes(action.value),
              }));
              return {
                ...item,
                actions: checkedActions,
                isSelected: checkedActions.every(
                  ({ isSelected }) => isSelected
                ),
              };
            })
          : resources;
        this.resources.set([...checkedResources]);
      });
  }
}
