"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { adminAPI } from "@/lib/admin-api";

interface SiteConfig {
  notification_text?: string;
  notification_link?: string;
  handbook_text?: string;
  handbook_url?: string;
  logo_filename?: string;
  site_name?: string;
  site_abbr?: string;
}

export default function ConfigPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAdminAuth();
  const [config, setConfig] = useState<SiteConfig>({});
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await adminAPI.getSiteConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!isAuthenticated) return;
    fetchConfig();
  }, [authLoading, isAuthenticated, router, fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await adminAPI.updateSiteConfig(config);
      setConfig(data);
      alert('配置已保存');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert(`保存失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav />

      <div className="mx-auto max-w-5xl px-4 pt-24 pb-10 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">站点配置</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            管理通知栏、手册按钮和站点基础信息。
          </p>
        </div>

        {configLoading ? (
          <div className="rounded-2xl bg-white/60 dark:bg-gray-800/70 px-6 py-10 text-center text-sm text-muted-foreground shadow">
            正在加载配置...
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>通知栏配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>通知文本</Label>
                  <Input
                    value={config.notification_text || ''}
                    onChange={(e) => setConfig({...config, notification_text: e.target.value})}
                    placeholder="欢迎来到W3CC 联合锦标赛！"
                  />
                </div>
                <div>
                  <Label>通知链接</Label>
                  <Input
                    value={config.notification_link || ''}
                    onChange={(e) => setConfig({...config, notification_link: e.target.value})}
                    placeholder="/matches"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>手册按钮配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>按钮文本</Label>
                  <Input
                    value={config.handbook_text || ''}
                    onChange={(e) => setConfig({...config, handbook_text: e.target.value})}
                    placeholder="查看赛事"
                  />
                </div>
                <div>
                  <Label>按钮链接</Label>
                  <Input
                    value={config.handbook_url || ''}
                    onChange={(e) => setConfig({...config, handbook_url: e.target.value})}
                    placeholder="/matches"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>站点信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>站点名称</Label>
                  <Input
                    value={config.site_name || ''}
                    onChange={(e) => setConfig({...config, site_name: e.target.value})}
                    placeholder="W3CC"
                  />
                </div>
                <div>
                  <Label>站点缩写</Label>
                  <Input
                    value={config.site_abbr || ''}
                    onChange={(e) => setConfig({...config, site_abbr: e.target.value})}
                    placeholder="W3"
                  />
                </div>
                <div>
                  <Label>Logo 文件名</Label>
                  <Input
                    value={config.logo_filename || ''}
                    onChange={(e) => setConfig({...config, logo_filename: e.target.value})}
                    placeholder="scc.png"
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存配置'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
