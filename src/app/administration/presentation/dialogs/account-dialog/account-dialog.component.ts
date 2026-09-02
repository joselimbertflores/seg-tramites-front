import {
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  inject,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  disabled,
  form,
  FormField,
  FormRoot,
  validate,
} from '@angular/forms/signals';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom, of } from 'rxjs';

import { Account } from '../../../domain';
import {
  AccountService,
  CreateAccountRequest,
  IdentityCandidate,
  UpdateAccountRequest,
} from '../../services/account.service';

interface AccountEditorModel {
  dependencyId: string;
  jobtitle: string;
  employmentType: string | null;
  isVisible: boolean;
  roleId: string;
}

interface CurrentAssignee {
  externalKey?: string;
  fullName: string;
  login?: string;
}

@Component({
  selector: 'app-account-dialog',
  imports: [
    FormField,
    FormRoot,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './account-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<AccountDialogComponent, Account>>(MatDialogRef);
  private readonly accountService = inject(AccountService);

  readonly data = inject<Account | undefined>(MAT_DIALOG_DATA);
  readonly minimumSearchLength = 3;
  readonly employmentTypes = ['ITEM', 'CONTRATO', 'OTROS'];
  readonly currentAssignee: CurrentAssignee | null = this.data?.user
    ? {
        externalKey: this.data.user.externalKey,
        fullName: this.data.user.fullname,
        login: this.data.user.login,
      }
    : null;
  readonly selectedAssignee = signal<IdentityCandidate | null>(null);
  readonly assignmentChanged = signal(false);
  readonly displayedAssignee = computed(() =>
    this.assignmentChanged() ? this.selectedAssignee() : this.currentAssignee
  );

  readonly selectedInstitution = signal<string | null>(
    this.data?.institution._id ?? null
  );
  readonly institutions = toSignal(this.accountService.getInstitutions(), {
    initialValue: [],
  });
  readonly dependencies = rxResource({
    params: () => ({ institutionId: this.selectedInstitution() }),
    stream: ({ params }) =>
      params.institutionId
        ? this.accountService.getDependencies(params.institutionId)
        : of([]),
  });
  readonly roles = toSignal(this.accountService.getRoles(), {
    initialValue: [],
  });

  readonly searchTerm = signal('');
  readonly candidateQuery = computed(() => this.searchTerm().trim());
  readonly debouncedCandidateQuery = debounced(this.candidateQuery, 350);
  readonly candidates = rxResource({
    params: () => ({ term: this.debouncedCandidateQuery.value().trim() }),
    stream: ({ params }) =>
      params.term.length >= this.minimumSearchLength
        ? this.accountService.searchIdentityCandidates(params.term)
        : of([]),
  });

  readonly formModel = signal<AccountEditorModel>({
    dependencyId: this.data?.dependencia._id ?? '',
    jobtitle: this.data?.jobtitle ?? '',
    employmentType: this.data?.employmentType ?? null,
    isVisible: this.data?.isVisible ?? true,
    roleId: this.data?.role._id ?? '',
  });

  readonly accountForm = form(
    this.formModel,
    (schemaPath) => {
      disabled(schemaPath, {
        when: ({ state }) => state.submitting(),
      });
      validate(schemaPath.dependencyId, ({ value }) =>
        value()
          ? null
          : { kind: 'required', message: 'Seleccione una dependencia.' }
      );
      validate(schemaPath.jobtitle, ({ value }) =>
        value().trim()
          ? null
          : { kind: 'required', message: 'Ingrese el cargo.' }
      );
      validate(schemaPath.roleId, ({ value }) =>
        value() ? null : { kind: 'required', message: 'Seleccione un rol.' }
      );
    },
    {
      submission: {
        action: async (formField) => {
          const value = formField().value();
          const commonRequest = {
            dependencyId: value.dependencyId,
            jobtitle: value.jobtitle.trim(),
            employmentType: value.employmentType,
            isVisible: value.isVisible,
            roleId: value.roleId,
          };

          const request = this.data
            ? this.accountService.update(
                this.data.id,
                this.buildUpdateRequest(commonRequest)
              )
            : this.accountService.create({
                ...commonRequest,
                assigneeExternalKey:
                  this.selectedAssignee()?.externalKey ?? null,
              });

          this.dialogRef.close(await firstValueFrom(request));
        },
      },
    }
  );

  readonly displayIdentity = (candidate: IdentityCandidate): string =>
    candidate?.fullName ?? '';

  onInstitutionChange(institutionId: string | null): void {
    if (institutionId === this.selectedInstitution()) return;
    this.selectedInstitution.set(institutionId);
    this.formModel.update((value) => ({ ...value, dependencyId: '' }));
    this.accountForm.dependencyId().markAsTouched();
  }

  onIdentityInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.selectedAssignee.set(null);
  }

  onIdentitySelected(event: MatAutocompleteSelectedEvent): void {
    const candidate = event.option.value as IdentityCandidate;
    this.selectedAssignee.set(candidate);
    this.assignmentChanged.set(true);
    this.searchTerm.set('');
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.selectedAssignee.set(null);
  }

  removeAssignee(): void {
    this.selectedAssignee.set(null);
    this.assignmentChanged.set(true);
    this.searchTerm.set('');
  }

  close(): void {
    if (this.accountForm().submitting()) return;
    this.dialogRef.close();
  }

  private buildUpdateRequest(
    commonRequest: Omit<CreateAccountRequest, 'assigneeExternalKey'>
  ): UpdateAccountRequest {
    return {
      ...commonRequest,
      ...(this.assignmentChanged() && {
        assigneeExternalKey: this.selectedAssignee()?.externalKey ?? null,
      }),
    };
  }
}
