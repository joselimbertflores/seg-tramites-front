import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';

import { UpdateAccountDialogComponent } from './update-account-dialog/update-account-dialog.component';
import { MaterialModule } from '../../../../material.module';
import { CreateAccountDialogComponent } from './create-account-dialog/create-account-dialog.component';
import {
  SearchInputComponent,
  ServerSelectSearchComponent,
  SimpleSelectOption,
  SimpleSelectSearchComponent,
} from '../../../../shared';
import { AccountService } from '../../services';
import { Account } from '../../../domain';

@Component({
    selector: 'app-accounts-manage',
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        OverlayModule,
        MatPaginatorModule,
        SearchInputComponent,
        ServerSelectSearchComponent,
        SimpleSelectSearchComponent,
    ],
    templateUrl: './accounts-manage.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AccountsManageComponent {
  private dialog = inject(MatDialog);
  private accountService = inject(AccountService);
  displayedColumns = [
    'visibility',
    'fullname',
    'jobtitle',
    'dependency',
    'state',
    'options',
  ];

  isOpen = false;
  institutions = signal<SimpleSelectOption<string>[]>([]);
  dependencies = signal<SimpleSelectOption<string>[]>([]);
  institution = signal<string | undefined>(undefined);
  dependency = signal<string | undefined>(undefined);

  datasource = signal<Account[]>([]);
  datasize = signal<number>(10);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  ngOnInit(): void {
    // this._getRequiredProps();
    this.getData();
  }

  getData() {
    this.accountService
      .findAll({
        term: this.term(),
        limit: this.limit(),
        offset: this.offset(),
        dependency: this.dependency(),
      })
      .subscribe(({ accounts, length }) => {
        this.datasource.set(accounts);
        this.datasize.set(length);
      });
  }

  create() {
    const dialogRef = this.dialog.open(CreateAccountDialogComponent, {
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((result?: Account) => {
      if (!result) return;
      this.datasource.update((values) => {
        if (values.length === this.limit()) values.pop();
        return [result, ...values];
      });
      this.datasize.update((value) => (value += 1));
    });
  }

  update(account: Account) {
    const dialogRef = this.dialog.open(UpdateAccountDialogComponent, {
      width: '700px',
      data: { ...account },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result?: Account) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex((value) => value.id === result.id);
        values[index] = result;
        return [...values];
      });
    });
  }

  search(term: string) {
    this.index.set(0);
    this.term.set(term);
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  onSelectInstitution(id: string): void {
    this.institution.set(id);
    this.dependency.set(undefined);
    this.dependencies.set([]);
    this.accountService.getDependenciesOfInstitution(id).subscribe((data) => {
      this.dependencies.set(
        data.map(({ _id, nombre }) => ({ value: _id, text: nombre }))
      );
    });
  }

  filter() {
    this.index.set(0);
    this.isOpen = false;
    this.getData();
  }

  reset() {
    this.institution.set(undefined);
    this.dependency.set(undefined);
    this.isOpen = false;
    this.getData();
  }

  private _getRequiredProps(): void {
    this.accountService.getInstitutions().subscribe((data) => {
      this.institutions.set(
        data.map(({ _id, nombre }) => ({
          text: nombre,
          value: _id,
        }))
      );
    });
  }
}
