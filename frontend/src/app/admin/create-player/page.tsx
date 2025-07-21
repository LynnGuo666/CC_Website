import { CreatePlayerForm } from "@/components/admin/CreatePlayerForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreatePlayerPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>创建新选手</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePlayerForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}