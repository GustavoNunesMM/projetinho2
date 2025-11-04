export interface Layout {
  id: number;
  name: string;
  header?: string;
  footer?: string;
  fontSize: string;
  fontFamily: string;
  lineSpacing: string;
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
  headerText: string;
  headerLocked: boolean;
  footerText: string;
  importedFrom: string | null;
}

export interface LayoutFormData extends Omit<Layout, "id"> {}
