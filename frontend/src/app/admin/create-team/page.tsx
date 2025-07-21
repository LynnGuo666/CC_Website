import { CreateTeamForm } from "@/components/admin/CreateTeamForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateTeamPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>创建新队伍</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTeamForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}