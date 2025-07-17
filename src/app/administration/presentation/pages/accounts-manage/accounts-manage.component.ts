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
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { OverlayModule } from '@angular/cdk/overlay';

import { AccountDialogComponent } from '../../dialogs/account-dialog/account-dialog.component';
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
    MatMenuModule,
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
  readonly displayedColumns = [
    'visibility',
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
        console.log(accounts);
        this.dataSource.set(accounts);
        this.dataSize.set(length);
      });
  }

  create() {
    const dialogRef = this.dialogRef.open(AccountDialogComponent, {
      width: '700px',
      maxWidth: '700px',
    });
    dialogRef.afterClosed().subscribe((result?: Account) => {
      if (!result) return;
      this.dataSource.update((items) =>
        [result, ...items].slice(0, this.limit())
      );
      this.dataSize.update((value) => (value += 1));
    });
  }

  update(account: Account) {
    const dialogRef = this.dialogRef.open(AccountDialogComponent, {
      width: '700px',
      maxWidth: '700px',
      data: account,
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

  resetCrendentials(item: Account) {
    this.accountService.resetAccountAccess(item.id).subscribe((login) => {});
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
