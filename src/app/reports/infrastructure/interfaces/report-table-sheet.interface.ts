export interface reportTableSheetProps {
  title: string;
  datasource: Object;
  columns: reportColumn[];
  parameters: Record<string, any>;
  labelsMap: Record<string, string>;
}

export interface reportColumn {
  header: string;
  columnDef: string;
}
