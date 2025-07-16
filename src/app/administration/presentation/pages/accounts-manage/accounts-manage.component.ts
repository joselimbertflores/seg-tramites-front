import { CommonModule } from '@angular/common';
import {
  inject,
  signal,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';

import { UpdateAccountDialogComponent } from './update-account-dialog/update-account-dialog.component';
import { CreateAccountDialogComponent } from '../../dialogs/create-account-dialog/create-account-dialog.component';
import {
  overlayAnimation,
  SearchInputComponent,
  SelectSearchComponent,
} from '../../../../shared';
import { AccountService } from '../../services';
import { Account } from '../../../domain';

@Component({
  selector: 'app-accounts-manage',
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
    MatToolbarModule,
    MatPaginatorModule,
    SearchInputComponent,
    SelectSearchComponent,
  ],
  templateUrl: './accounts-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [overlayAnimation],
})
export default class AccountsManageComponent {
  private dialogRef = inject(MatDialog);
  private accountService = inject(AccountService);
  displayedColumns = [
    'visibility',
    'login',
    'fullname',
    'jobtitle',
    'dependency',
    'state',
    'options',
  ];

  dataSource = signal<Account[]>([]);
  dataSize = signal<number>(0);
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  isOpen = false;
  institutions = this.accountService.institutions;
  dependencies = this.accountService.dependencies;
  selectedInstition = this.accountService.selectedInstitution;
  selectedDependecy = this.accountService.selectedDependency;

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.accountService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ accounts, length }) => {
        this.dataSource.set(accounts);
        this.dataSize.set(length);
      });
  }

  create() {
    const dialogRef = this.dialogRef.open(CreateAccountDialogComponent, {
      width: '800px',
      maxWidth: '800px',
    });
    dialogRef.afterClosed().subscribe((result?: Account) => {
      if (!result) return;
      this.dataSource.update((values) =>
        [result, ...values].slice(0, this.limit())
      );
      this.dataSize.update((value) => (value += 1));
    });
  }

  update(account: Account) {
    const dialogRef = this.dialogRef.open(UpdateAccountDialogComponent, {
      width: '900px',
      data: { ...account },
    });
    dialogRef.afterClosed().subscribe((result?: Account) => {
      if (!result) return;
      this.dataSource.update((values) => {
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

  filter() {
    this.isOpen = false;
    if (!this.selectedDependecy() && !this.selectedInstition()) return;
    this.index.set(0);
    this.getData();
  }

  reset() {
    this.index.set(0);
    this.isOpen = false;
    this.selectedInstition.set(null);
    this.selectedDependecy.set(null);
    this.getData();
  }
}
