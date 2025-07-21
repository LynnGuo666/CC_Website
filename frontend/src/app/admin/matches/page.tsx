'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getMatches, Match } from '@/services/matchService';
import { getTeams, Team } from '@/services/teamService';
import { API_BASE_URL } from '@/services/config';

interface MatchFormData {
  name: string;
  description: string;
  status: 'preparing' | 'ongoing' | 'finished' | 'cancelled';
  start_time?: string;
  end_time?: string;
  winning_team_id?: number;
  participant_ids: number[];
}

export default function MatchesManagement() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<MatchFormData>({
    name: '',
    description: '',
    status: 'preparing',
    participant_ids: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matchesData, teamsData] = await Promise.all([
        getMatches(),
        getTeams()
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          winning_team_id: formData.winning_team_id || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create match');
      }

      await loadData();
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create match:', error);
      alert('创建比赛失败');
    }
  };

  const handleEditMatch = async () => {
    if (!editingMatch) return;

    try {
      const response = await fetch(`${API_BASE_URL}/matches/${editingMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          winning_team_id: formData.winning_team_id || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update match');
      }

      await loadData();
      setShowEditDialog(false);
      setEditingMatch(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update match:', error);
      alert('更新比赛失败');
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm('确定要删除这个比赛吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete match');
      }

      await loadData();
    } catch (error) {
      console.error('Failed to delete match:', error);
      alert('删除比赛失败');
    }
  };

  const openEditDialog = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      name: match.name,
      description: match.description || '',
      status: match.status,
      start_time: match.start_time ? new Date(match.start_time).toISOString().slice(0, 16) : '',
      end_time: match.end_time ? new Date(match.end_time).toISOString().slice(0, 16) : '',
      winning_team_id: match.winning_team_id || undefined,
      participant_ids: match.participants.map(team => team.id)
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'preparing',
      participant_ids: []
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Badge variant="secondary">筹办中</Badge>;
      case 'ongoing':
        return <Badge variant="default" className="bg-blue-500">进行中</Badge>;
      case 'finished':
        return <Badge variant="default" className="bg-green-500">已结束</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">已取消</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleTeamToggle = (teamId: number) => {
    setFormData(prev => ({
      ...prev,
      participant_ids: prev.participant_ids.includes(teamId)
        ? prev.participant_ids.filter(id => id !== teamId)
        : [...prev.participant_ids, teamId]
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">加载数据中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">比赛管理</h1>
            <p className="text-muted-foreground">管理所有比赛的创建、编辑和删除</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                创建比赛
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>创建新比赛</DialogTitle>
                <DialogDescription>
                  填写比赛信息来创建一个新的比赛
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">比赛名称</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入比赛名称"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">比赛描述</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入比赛描述"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">开始时间</label>
                    <Input
                      type="datetime-local"
                      value={formData.start_time || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">结束时间</label>
                    <Input
                      type="datetime-local"
                      value={formData.end_time || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">参赛队伍</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`team-${team.id}`}
                          checked={formData.participant_ids.includes(team.id)}
                          onChange={() => handleTeamToggle(team.id)}
                          className="rounded"
                        />
                        <label htmlFor={`team-${team.id}`} className="text-sm font-medium cursor-pointer">
                          {team.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateMatch} disabled={!formData.name}>
                  创建比赛
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Matches Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>比赛列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>比赛名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>参赛队伍</TableHead>
                  <TableHead>游戏数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.name}</TableCell>
                    <TableCell>{getStatusBadge(match.status)}</TableCell>
                    <TableCell>{match.participants.length} 支队伍</TableCell>
                    <TableCell>{match.match_games.length} 个游戏</TableCell>
                    <TableCell>
                      {new Date(match.created_at).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(match)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMatch(match.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>编辑比赛</DialogTitle>
              <DialogDescription>
                修改比赛信息
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">比赛名称</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入比赛名称"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">比赛描述</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入比赛描述"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">比赛状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'preparing' | 'ongoing' | 'finished' | 'cancelled' 
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="preparing">筹办中</option>
                  <option value="ongoing">进行中</option>
                  <option value="finished">已结束</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">开始时间</label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">结束时间</label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              {formData.status === 'finished' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">获胜队伍</label>
                  <select
                    value={formData.winning_team_id || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      winning_team_id: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">选择获胜队伍</option>
                    {teams.filter(team => formData.participant_ids.includes(team.id)).map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">参赛队伍</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-team-${team.id}`}
                        checked={formData.participant_ids.includes(team.id)}
                        onChange={() => handleTeamToggle(team.id)}
                        className="rounded"
                      />
                      <label htmlFor={`edit-team-${team.id}`} className="text-sm font-medium cursor-pointer">
                        {team.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button onClick={handleEditMatch} disabled={!formData.name}>
                保存修改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}