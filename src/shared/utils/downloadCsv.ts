export type CsvColumn<T> = {
  header: string;
  value: (row: T) => unknown;
};

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) return '';

  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;

  return `"${text.replace(/"/g, '""')}"`;
};

export const createReportFilename = (name: string) => {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${name}-${timestamp}.csv`;
};

export const downloadCsv = <T>(filename: string, rows: T[], columns: CsvColumn<T>[]) => {
  const header = columns.map((column) => escapeCsvValue(column.header)).join(',');
  const body = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(','),
  );
  const csv = [header, ...body].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
