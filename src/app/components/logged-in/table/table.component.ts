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

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {TableHeaderItem, TableItem, TableModel} from 'carbon-components-angular';

interface OverflowMenuItems {
  edit: boolean;
  delete: boolean;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {
  @Input()
  public tableTitle?: string;

  @Input()
  public tableDescription?: string;

  @Input()
  public overflowMenuItems: OverflowMenuItems = {edit: false, delete: false};

  @Input()
  public searchEnabled: boolean = true;

  @Input()
  public paginationEnabled: boolean = true;

  @Input()
  public unpaginatedTableData: TableItem[][] = [];

  @Input()
  public tableDataHeader: TableHeaderItem[] = [];

  @Input()
  public striped: boolean = false;

  @Input()
  public singleSelectEnabled: boolean = false;

  @Input()
  public addButtonEnabled: boolean = false;

  @Input()
  public isLoading: boolean = false;

  @Input()
  public emptyTableMessage: string = 'No data has been received.';

  @Input()
  public showSelectionColumn: boolean = false;

  @Output()
  public editRow: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public deleteRow: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public addToTable: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('overflowMenuItemTemplate', {static: true})
  private readonly overflowMenuItemTemplate?: TemplateRef<any>;

  public searchString: string = '';
  public tableModel: TableModel = new TableModel();
  public noDataReceivedColumnLength?: number;

  private unpaginatedSearchTableData: TableItem[][] = [];

  public ngOnInit(): void {
    this.setCurrentPage(1);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.handleOnTableDataHeaderChange(changes);
    this.handleOnUnpaginatedTableDataChange(changes);
  }

  public setTableDataForSearchString(searchString: string): void {
    this.searchString = searchString;

    if (this.searchString) {
      this.unpaginatedSearchTableData = this.getDataMatchingSearchString(searchString);
    }

    this.setCurrentPage(1);
  }

  public clearSearchString(): void {
    this.setTableDataForSearchString('');
  }

  public setCurrentPage(page: number): void {
    this.tableModel.currentPage = page;

    this.setTableDataForCurrentPage();
  }

  private handleOnUnpaginatedTableDataChange(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('unpaginatedTableData')) {
      if (this.isOverflowMenuEnabled()) {
        this.unpaginatedTableData = this.addOverflowMenu(this.unpaginatedTableData);
      }
      if (this.searchString) {
        this.unpaginatedSearchTableData = this.getDataMatchingSearchString(this.searchString);
      }
      if (!this.paginationEnabled) {
        this.tableModel.pageLength = this.unpaginatedTableData.length;
      }

      this.setCurrentPage(this.tableModel.currentPage);
    }
  }

  private isOverflowMenuEnabled(): boolean {
    return this.overflowMenuItems.edit || this.overflowMenuItems.delete;
  }

  private addOverflowMenu(tableData: TableItem[][]): TableItem[][] {
    return tableData.map((row) => {
      row[row.length - 1].template = this.overflowMenuItemTemplate!;

      return row;
    });
  }

  private setTableDataForCurrentPage(): void {
    const start = (this.tableModel.currentPage - 1) * this.tableModel.pageLength;
    const end = start + this.tableModel.pageLength;

    if (this.searchString) {
      this.updateTableData(this.unpaginatedSearchTableData.slice(start, end), this.unpaginatedSearchTableData);
    } else {
      this.updateTableData(this.unpaginatedTableData.slice(start, end), this.unpaginatedTableData);
    }
  }

  private updateTableData(data: TableItem[][], unpaginatedData: TableItem[][]): void {
    this.tableModel.data = data;
    this.tableModel.totalDataLength = unpaginatedData.length;
  }

  private getDataMatchingSearchString(searchString: string): TableItem[][] {
    return this.unpaginatedTableData.filter((tableRow) => {
      const isMatch = (tableItem: TableItem) => typeof tableItem.data === 'string' && tableItem.data.toLowerCase().includes(searchString.toLowerCase());

      return tableRow.some(isMatch);
    });
  }

  private handleOnTableDataHeaderChange(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('tableDataHeader')) {
      this.tableModel.header = this.tableDataHeader;

      this.noDataReceivedColumnLength = this.showSelectionColumn ? (this.tableModel.header.length + 1) : this.tableModel.header.length;
    }
  }
}
