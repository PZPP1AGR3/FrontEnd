export interface ListItem {
  label: string;
  value: string;
  command: () => void;
  [k: string]: any;
}
