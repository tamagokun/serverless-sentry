export type Breadcrumb = {
  timestamp: number;
  category: string;
  data: Record<string, any>;
  message?: string;
  type?: string;
};

export type StackFrame = {
  filename: string;
  function: string;
  in_app: boolean;
  lineno: number;
  colno: number;
};
