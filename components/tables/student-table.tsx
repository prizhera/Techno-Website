import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StudentRow = {
  name: string;
  id: string;
  status: string;
  lastAssessment?: string;
};

export function StudentTable({ rows }: { rows: StudentRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Last Assessment</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium text-slate-800">{student.name}</TableCell>
            <TableCell>{student.id}</TableCell>
            <TableCell>{student.lastAssessment ?? "-"}</TableCell>
            <TableCell>
              <StatusBadge status={student.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}