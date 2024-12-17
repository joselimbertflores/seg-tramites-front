import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import {
  SimpleSelectOption,
  SimpleSelectSearchComponent,
} from '../../../../../shared';
import { ExternalService } from '../../../services';
import { CustomValidators } from '../../../../../../helpers';
import { ExternalProcedure } from '../../../../domain';
import { typeProcedure } from '../../../../../administration/infrastructure';

interface requirementOption {
  name: string;
  isSelected: boolean;
}

@Component({
    selector: 'app-external-dialog',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatStepperModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCheckboxModule,
        SimpleSelectSearchComponent,
    ],
    templateUrl: './external-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalDialogComponent {
  private formBuilder = inject(FormBuilder);
  private externalService = inject(ExternalService);
  private ddialogRef = inject(MatDialogRef<ExternalDialogComponent>);

  data = inject<ExternalProcedure | undefined>(MAT_DIALOG_DATA);
  applicantType = signal<'NATURAL' | 'JURIDICO'>('NATURAL');
  hasRepresentative = signal<boolean>(false);

  segments = signal<SimpleSelectOption<string>[]>([]);
  typesProcedures = signal<SimpleSelectOption<typeProcedure>[]>([]);
  requirements = signal<requirementOption[]>([]);

  formProcedure: FormGroup = this.formBuilder.group({
    segment: ['', Validators.required],
    numberOfDocuments: ['', Validators.required],
    reference: ['', Validators.required],
    type: ['', Validators.required],
    cite: [''],
  });

  formApplicant = computed<FormGroup>(() =>
    this.applicantType() === 'NATURAL'
      ? this._createFormApplicantNatural()
      : this._createFormApplicantJuridico()
  );
  formRepresentative = computed<FormGroup>(() =>
    this.hasRepresentative()
      ? this._createFormRepresentative()
      : this.formBuilder.group({})
  );

  ngOnInit(): void {
    this._loadForm();
    this._getRequiredProps();
  }

  selectSegmentProcedure(segment: string) {
    this.formProcedure.patchValue({ segment, type: '' });
    this.requirements.set([]);
    this.externalService
      .getTypesProceduresBySegment(segment)
      .subscribe((types) => {
        this.typesProcedures.set(
          types.map((type) => ({ value: type, text: type.nombre }))
        );
      });
  }

  selectTypeProcedure(type: typeProcedure) {
    this.formProcedure.patchValue({ type: type._id, reference: type.nombre });
    this.requirements.set(
      type.requerimientos
        .filter((requirement) => requirement.activo)
        .map((type) => ({ name: type.nombre, isSelected: true }))
    );
  }

  save(): void {
    const form = {
      formProcedure: this.formProcedure.value,
      formApplicant: this.formApplicant().value,
      formRepresentative: this.formRepresentative().value,
      requirements: this.requirements()
        .filter(({ isSelected }) => isSelected)
        .map(({ name }) => name),
    };
    const subscriptipn = this.data
      ? this.externalService.update(this.data._id, form)
      : this.externalService.create(form);

    subscriptipn.subscribe((procedure) => {
      this.ddialogRef.close(procedure);
    });
  }

  get isFormValid(): boolean {
    return (
      this.formProcedure.valid &&
      this.formApplicant().valid &&
      this.formRepresentative().valid
    );
  }

  private _createFormRepresentative(): FormGroup {
    return this.formBuilder.group({
      firstname: ['', [Validators.required, CustomValidators.onlyLetters]],
      middlename: ['', [Validators.required, CustomValidators.onlyLetters]],
      lastname: ['', CustomValidators.onlyLetters],
      dni: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern('^[a-zA-Z0-9-]*$'),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern(/^[0-9-]*$/),
        ],
      ],
    });
  }

  private _createFormApplicantNatural(): FormGroup {
    return this.formBuilder.group({
      firstname: ['', [Validators.required, CustomValidators.onlyLetters]],
      middlename: ['', [Validators.required, CustomValidators.onlyLetters]],
      lastname: ['', CustomValidators.onlyLetters],
      dni: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern('^[a-zA-Z0-9-]*$'),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern('^[0-9-]*$'),
        ],
      ],
      type: ['NATURAL'],
    });
  }

  private _createFormApplicantJuridico(): FormGroup {
    return this.formBuilder.group({
      firstname: ['', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.pattern('^[0-9-]*$'),
        ],
      ],
      type: ['JURIDICO'],
    });
  }
  private _loadForm(): void {
    if (!this.data) return;
    const { applicant, representative, ...props } = this.data;
    this.formProcedure.removeControl('type');
    this.formProcedure.removeControl('segment');
    this.formProcedure.patchValue(props);

    this.applicantType.set(applicant.type);
    this.formApplicant().patchValue(applicant);

    this.hasRepresentative.set(representative ? true : false);
    this.formRepresentative().patchValue(representative ?? {});
  }

  private _getRequiredProps(): void {
    this.externalService.getSegments().subscribe((segments) => {
      const options: SimpleSelectOption<string>[] = segments.map((segment) => ({
        text: segment,
        value: segment,
      }));
      this.segments.set(options);
    });
  }
}
