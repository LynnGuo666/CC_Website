import { CreateMatchForm } from "@/components/admin/CreateMatchForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CreateMatchPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>创建新赛事</CardTitle>
            <CardDescription>填写赛事基本信息，并为其添加一个或多个赛程。</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateMatchForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}