import { CommonModule } from '@angular/common';
import {
  inject,
  signal,
  computed,
  Component,
  ChangeDetectionStrategy,
  resource,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { firstValueFrom, of } from 'rxjs';

import {
  overlayAnimation,
  SearchInputComponent,
  SelectSearchComponent,
} from '../../../../shared';
import { AccountService } from '../../services';
import { AccountDialogComponent } from '../../dialogs';
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

  institutions = toSignal(this.accountService.getInstitutions(), {
    initialValue: [],
  });
  selectedInstitution = signal<string | null>(null);
  selectedDependency = signal<string | null>(null);
  dependencies = resource({
    params: () => ({ institution: this.selectedInstitution() }),
    loader: ({ params }) =>
      params.institution
        ? firstValueFrom(
            this.accountService.getDependencies(params.institution)
          )
        : firstValueFrom(of([])),
  });

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.accountService
      .findAll({
        term: this.term(),
        limit: this.limit(),
        offset: this.offset(),
        institution: this.selectedInstitution(),
        dependency: this.selectedDependency(),
      })
      .subscribe(({ accounts, length }) => {
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

  update(item: Account) {
    const dialogRef = this.dialogRef.open(AccountDialogComponent, {
      width: '700px',
      maxWidth: '700px',
      data: item,
    });
    dialogRef.afterClosed().subscribe((result?: Account) => {
      if (!result) return;
      this.dataSource.update((values) => {
        const index = values.findIndex((value) => value.id === result.id);
        if (index === -1) return values;
        values[index] = result;
        return [...values];
      });
    });
  }

  resetPassword(item: Account) {
    this.accountService.resetAccountPassword(item.id).subscribe();
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
    if (!this.selectedDependency() && !this.selectedInstitution()) return;
    this.index.set(0);
    this.getData();
  }

  reset() {
    this.isOpen = false;
    this.selectedInstitution.set(null);
    this.selectedDependency.set(null);
    this.index.set(0);
    this.getData();
  }
}
