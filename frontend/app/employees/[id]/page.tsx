import { WorkflowBuilder } from "@/components/workflow-builder";
export default async function EmployeeWorkflow({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkflowBuilder employeeId={id} />;
}
