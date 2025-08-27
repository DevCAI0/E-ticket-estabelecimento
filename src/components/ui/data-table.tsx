import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Definindo interfaces para tipar os dados da tabela
interface Column {
  accessorKey?: string;
  id?: string;
  header: React.ReactNode;
  cell?: (props: {
    row: Row;
    getValue: (key: string) => any;
  }) => React.ReactNode;
}

interface Row {
  id?: string | number;
  [key: string]: any;
  original: Record<string, any>;
}

interface DataTableProps {
  columns: Column[];
  data: Row[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  loading = false,
  emptyMessage = "Nenhum dado encontrado",
}: DataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.accessorKey || column.id || String(column.header)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((row) => (
              <TableRow key={row.id || Math.random().toString()}>
                {columns.map((column) => (
                  <TableCell
                    key={
                      column.accessorKey || column.id || String(column.header)
                    }
                  >
                    {column.cell
                      ? column.cell({
                          row,
                          getValue: (key: string) => row[key],
                        })
                      : column.accessorKey
                        ? row[column.accessorKey]
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
