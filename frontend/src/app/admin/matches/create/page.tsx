'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getTeams, type Team } from '@/services/teamService';

interface MatchFormData {
  name: string;
  description: string;
  status: 'preparing' | 'ongoing' | 'finished' | 'cancelled';
  prize_pool?: string;
  max_teams?: number;
  participant_ids: number[];
  start_time?: string;
  end_time?: string;
}

export default function CreateMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState<MatchFormData>({
    name: '',
    description: '',
    status: 'preparing',
    participant_ids: [],
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Import the match service
      const { createMatch } = await import('@/services/matchService');
      
      // Prepare the data for API call
      const matchData = {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status as 'preparing' | 'ongoing' | 'finished' | 'cancelled',
        prize_pool: formData.prize_pool || undefined,
        max_teams: formData.max_teams || undefined,
        participant_team_ids: formData.participant_ids,
        start_time: formData.start_time ? new Date(formData.start_time) : undefined,
        end_time: formData.end_time ? new Date(formData.end_time) : undefined,
      };

      const newMatch = await createMatch(matchData);
      console.log('Match created successfully:', newMatch);
      
      // Show success message and redirect
      alert('比赛创建成功！');
      router.push('/admin/matches');
    } catch (error) {
      console.error('Failed to create match:', error);
      alert('比赛创建失败，请检查输入信息并重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelection = (teamId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      participant_ids: checked
        ? [...prev.participant_ids, teamId]
        : prev.participant_ids.filter(id => id !== teamId)
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/matches">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">创建新比赛</h1>
            <p className="text-muted-foreground">填写比赛信息并选择参赛队伍</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">比赛名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入比赛名称"
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    status: value as MatchFormData['status']
                  }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparing">筹办中</SelectItem>
                    <SelectItem value="ongoing">进行中</SelectItem>
                    <SelectItem value="finished">已结束</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">比赛描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入比赛描述"
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prize_pool">奖金池</Label>
                <Input
                  id="prize_pool"
                  value={formData.prize_pool || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, prize_pool: e.target.value }))}
                  placeholder="例: ¥10,000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="max_teams">最大队伍数</Label>
                <Input
                  id="max_teams"
                  type="number"
                  value={formData.max_teams || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_teams: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="例: 16"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start_time">开始时间</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="end_time">结束时间</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Selection */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>参赛队伍</span>
              <Badge variant="outline">
                已选择 {formData.participant_ids.length} 支队伍
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">暂无队伍可选</p>
                <Button variant="outline" asChild>
                  <Link href="/admin/teams/create">创建新队伍</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`team-${team.id}`}
                      checked={formData.participant_ids.includes(team.id)}
                      onCheckedChange={(checked) => 
                        handleTeamSelection(team.id, checked as boolean)
                      }
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: team.color || '#6b7280' }}
                      />
                      <Label
                        htmlFor={`team-${team.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {team.name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/matches">取消</Link>
          </Button>
          <Button type="submit" disabled={loading || !formData.name.trim()}>
            {loading ? '创建中...' : '创建比赛'}
          </Button>
        </div>
      </form>
    </div>
  );
}