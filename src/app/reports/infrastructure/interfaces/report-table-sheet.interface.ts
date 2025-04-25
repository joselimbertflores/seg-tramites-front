export interface reportTableSheetProps {
  title: string;
  datasource: datas[];
  columns: reportColumn[];
  parameters: Record<string, any>;
  labelsMap: Record<string, string>;
}

export interface reportColumn {
  header: string;
  columnDef: keyof datas;
}

interface datas {
  [key: string]: string | number;
}
