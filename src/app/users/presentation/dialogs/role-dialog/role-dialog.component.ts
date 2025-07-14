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
import { RoleService } from '../../services';
import { resource, role } from '../../../infrastructure';



@Component({
    selector: 'app-role-dialog',
    templateUrl: './role-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatIconModule,
        CdkAccordionModule,
        MatCheckboxModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
    ]
})
export class RoleDialogComponent {
  private dialogRef = inject(MatDialogRef);
  private roleService = inject(RoleService);

  public data = inject<role | undefined>(MAT_DIALOG_DATA);
  public name = new FormControl('', Validators.required);
  public resources = signal<resource[]>([]);

  hasPermissions = computed(() =>
    this.resources().some(
      ({ actions }) => actions.some((action) => action.isSelected)
    )
  );
  

  ngOnInit(): void {
    this.roleService.getResources().subscribe((resources) => {
      console.log(resources);
      this.loadResources(resources);
    });
  }

  save(): void {
    if (this.name.invalid || !this.hasPermissions()) return;
    const subscription = this.data
      ? this.roleService.edit(this.data._id, this.name.value!, this.resources())
      : this.roleService.add(this.name.value!, this.resources());
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  setAllPermissions(resource: string, isSelected: boolean) {
    this.resources.update((values) => {
      const index = values.findIndex(({ value }) => value === resource);
      values[index].isSelected = isSelected;
      values[index].actions.forEach(
        (action) => (action.isSelected = isSelected)
      );
      return [...values];
    });
  }

  updateAllComplete(resource: string) {
    this.resources.update((values) => {
      const index = values.findIndex(({ value }) => value === resource);
      values[index].isSelected = values[index].actions.every(
        (action) => action.isSelected
      );
      return [...values];
    });
  }

  someComplete(validResource: string): boolean {
    const index = this.resources().findIndex(
      (resource) => resource.value === validResource
    );
    const resorce = this.resources()[index];
    return (
      resorce.actions.filter((action) => action.isSelected).length > 0 &&
      !resorce.isSelected
    );
  }

  loadResources(resources: resource[]) {
    if (!this.data) return this.resources.set(resources);
    const { permissions, name } = this.data;
    this.name.setValue(name);
    const checkedResources = resources.map((resource) => {
      const hasPermission = permissions.find(
        (perm) => perm.resource === resource.value
      );
      if (hasPermission) {
        const checkedActions = resource.actions.map((action) => ({
          ...action,
          isSelected: hasPermission.actions.includes(action.value),
        }));
        resource.actions = checkedActions;
        resource.isSelected = checkedActions.every(
          ({ isSelected }) => isSelected
        );
      }
      return resource;
    });
    this.resources.set(checkedResources);
  }
}
