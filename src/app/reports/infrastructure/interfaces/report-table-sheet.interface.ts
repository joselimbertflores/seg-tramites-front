export interface reportTableSheetProps {
  title: string;
  datasource: datasource[];
  columns: column[];
  parameters: parameters;
}
interface datasource {
  [key: string]: string | number;
}
interface column {
  header: string;
  columnDef: keyof datasource;
  width?: 'auto' | '*';
}

interface parameters {
  form: Object;
  labelsMap: Record<string, string>;
}
