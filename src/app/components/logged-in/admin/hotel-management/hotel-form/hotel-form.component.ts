/*
 * Copyright 2021 Bundesreplublik Deutschland
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, EventEmitter, Output, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators, FormArray} from '@angular/forms';
import {ModalService, TableHeaderItem, TableItem} from 'carbon-components-angular';
import {FormValidator} from 'src/app/utilities/form-validators/form-validator';
import {EditDeskModalComponent} from '../desk/edit-desk-modal/edit-desk-modal.component';
import {AddDeskModalComponent} from '../desk/add-desk-modal/add-desk-modal.component';
import {HotelDTO} from 'src/api-client';

@Component({
  selector: 'app-hotel-form',
  templateUrl: './hotel-form.component.html',
  styleUrls: ['./hotel-form.component.scss']
})
export class HotelFormComponent implements OnInit {
  public hotelForm: FormGroup;
  public hotelFormDesks: FormArray;
  public tableData: TableItem[][] = [];
  public tableHeaders: TableHeaderItem[] = [];
  public loading: boolean = true;

  @Output()
  private readonly submitForm: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  private readonly discardForm: EventEmitter<void> = new EventEmitter<void>();

  public constructor(public readonly formValidator: FormValidator,
                     private readonly formBuilder: FormBuilder,
                     private readonly modalService: ModalService) {
    this.hotelForm = this.createHotelForm();
    this.hotelFormDesks = this.hotelForm.get('desks') as FormArray;
  }

  public async ngOnInit(): Promise<void> {
    this.tableHeaders = this.createTableHeaders();
    this.tableData = this.createDesksTableData();
    this.loading = false;
  }

  public submit(): void {
    this.submitForm.emit();
  }

  public discard(): void {
    this.discardForm.emit();
  }

  public openAddNewDeskModal(): void {
    const addNewDeskModal = this.modalService.create({component: AddDeskModalComponent});

    addNewDeskModal.onDestroy(() => {
      const deskFormValue = addNewDeskModal.instance.deskFormValue;

      if (deskFormValue) {
        this.addNewDesk(deskFormValue.deskId, deskFormValue.deskName);
      }
    });
  }

  public openEditDeskModal(data: any): void {
    const editDeskModal = this.modalService.create({
      component: EditDeskModalComponent,
      inputs: {
        deskName: data.name
      }
    });

    editDeskModal.onDestroy(() => {
      if (editDeskModal.instance.deskName) {
        this.updateDeskNameById(editDeskModal.instance.deskName, data.id);
      }
    });
  }

  public deleteDesk(id: string): void {
    this.hotelFormDesks.controls = this.hotelFormDesks.controls.filter((desk) => desk.value.id !== id);
    this.tableData = this.createDesksTableData();
  }

  public createDesksTableData(): TableItem[][] {
    const tableData: TableItem[][] = [];

    this.hotelFormDesks.controls.forEach((desk) => {
      tableData.push([
        new TableItem({data: desk.value.name}),
        new TableItem({data: {id: desk.value.id, name: desk.value.name}, template: undefined})
      ]);
    });

    return tableData;
  }

  public populateHotelForm(hotel: HotelDTO): void {
    this.hotelForm.patchValue({
      id: hotel.id,
      name: hotel.name,
      address: {
        street: hotel.address.street,
        houseNumber: hotel.address.houseNumber,
        postalCode: hotel.address.postalCode,
        city: hotel.address.city
      }
    });
    hotel.desks.forEach((desk) => {
      this.addNewDesk(desk.id, desk.name);
    });

    this.tableData = this.createDesksTableData();
  }

  public disableHotelIdField(): void {
    this.hotelForm.get('id')!.disable();
  }

  private createHotelForm(): FormGroup {
    return this.formBuilder.group({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(50),
        this.formValidator.requiredNoWhitespaceFill()
      ]),
      id: new FormControl('', [
        Validators.required,
        Validators.maxLength(50),
        this.formValidator.requiredNoWhitespaceFill()
      ]),
      address: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.maxLength(50),
          this.formValidator.requiredNoWhitespaceFill()
        ]),
        houseNumber: new FormControl('', [
          Validators.required,
          Validators.maxLength(50),
          this.formValidator.requiredNoWhitespaceFill()
        ]),
        postalCode: new FormControl('', [
          Validators.required,
          Validators.maxLength(50),
          this.formValidator.requiredNoWhitespaceFill()
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.maxLength(50),
          this.formValidator.requiredNoWhitespaceFill()
        ])
      }),
      desks: this.formBuilder.array([])
    });
  }

  private createTableHeaders(): TableHeaderItem[] {
    return [
      new TableHeaderItem({data: 'Desks'}),
      new TableHeaderItem()
    ];
  }

  private addNewDesk(deskId: string, deskName: string): void {
    this.hotelFormDesks.push(
      this.formBuilder.group({
        id: [deskId, Validators.required],
        name: [deskName, Validators.required]
      })
    );

    this.tableData = this.createDesksTableData();
  }

  private updateDeskNameById(newDeskName: string, deskId: string): void {
    this.hotelFormDesks.controls.forEach((desk) => {
      if (desk.value.id === deskId) {
        desk.get('name')!.setValue(newDeskName);
      }
    });

    this.tableData = this.createDesksTableData();
  }
}
