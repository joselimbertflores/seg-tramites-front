import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';

import {
  Communication,
  StateProcedure,
  StatusMail,
} from '../../../../domain/models';
import { MaterialModule } from '../../../../material.module';
import {
  AlertService,
  ArchiveService,
  CommunicationService,
  PdfService,
} from '../../../services';
import { transferDetails } from '../../../../infraestructure/interfaces';
import { DispatcherComponent } from '../dispatcher/dispatcher.component';


const ActionMap = {
  [StateProcedure.Concluido]: 'Concluir',
  [StateProcedure.Suspendido]: 'Suspender',
};

@Component({
  selector: 'mail',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './mail.component.html',
  styleUrl: './mail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailComponent {
  private archiveService = inject(ArchiveService);
  private alertService = inject(AlertService);
  private inboxService = inject(CommunicationService);
  private pdfService = inject(PdfService);
  private dialog = inject(MatDialog);

  mail = model.required<Communication | null>();

  accept() {
    this.alertService.QuestionAlert({
      title: `¿Aceptar tramite ${this.detail.procedure.code}?`,
      text: 'Solo debe aceptar tramites que haya recibido en fisico',
      callback: () => {
        this.inboxService.accept(this.detail._id).subscribe(() => {
          this.mail.set(this.detail.copyWith({ status: StatusMail.Received }));
        });
      },
    });
  }

  reject() {
    this.alertService.ConfirmAlert({
      title: `¿Rechazar tramite ${this.detail.procedure.code}?`,
      text: 'El tramite sera devuelto al funcionario emisor',
      callback: (descripion) => {
        this.inboxService.reject(this.detail._id, descripion).subscribe(() => {
          this.mail.set(this.detail.copyWith({ status: StatusMail.Rejected }));
        });
      },
    });
  }

  send() {
    const detail: transferDetails = {
      id_mail: this.detail._id,
      code: this.detail.procedure.code,
      id_procedure: this.detail.procedure._id,
      attachmentQuantity: this.detail.attachmentQuantity,
    };
    const dialogRef = this.dialog.open(DispatcherComponent, {
      maxWidth: '1200px',
      width: '1200px',
      data: detail,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.mail.set(this.detail.copyWith({ status: StatusMail.Completed }));
    });
  }

  archive(state: StateProcedure.Concluido | StateProcedure.Suspendido) {
    this.alertService.ConfirmAlert({
      title: `${ActionMap[state]} el tramite ${this.detail.procedure.code}?`,
      text: 'El tramite pasara a su seccion de archivos',
      callback: (description) => {
        this.archiveService
          .create(this.detail._id, description, state)
          .subscribe(() => {
            this.mail.set(
              this.detail.copyWith({ status: StatusMail.Completed })
            );
          });
      },
    });
  }

  get detail() {
    return this.mail()!;
  }

  get StateProcedure() {
    return StateProcedure;
  }
}
