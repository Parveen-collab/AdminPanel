import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Paper, Stack, Switch, TextField, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Refresh, CloudUpload } from '@mui/icons-material';
import Layout from '../../components/Layout/Layout';
import { cmsApi, Team as TeamType, TeamRequest } from '../../api/cmsApi';
import Loading from '../../components/common/Loading';

const Team: React.FC = () => {
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamType | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [formData, setFormData] = useState<TeamRequest>({
    name: '', jobRole: '', portfolioLink: '', imageUrl: '', isActive: true, displayOrder: 0,
  });

  useEffect(() => {
    loadTeams();
  }, [showActiveOnly]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getTeams(showActiveOnly);
      setTeams(res.payload || []);
    } catch (err: any) {
      console.error('Failed to load teams', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (team?: TeamType) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name || '', jobRole: team.jobRole || '', portfolioLink: team.portfolioLink || '',
        imageUrl: team.imageUrl || '', isActive: team.isActive ?? true, displayOrder: team.displayOrder || 0,
      });
    } else {
      setEditingTeam(null);
      setFormData({ name: '', jobRole: '', portfolioLink: '', imageUrl: '', isActive: true, displayOrder: 0 });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingTeam?.id) {
        await cmsApi.updateTeam(editingTeam.id, formData);
      } else {
        await cmsApi.createTeam(formData);
      }
      setOpenDialog(false);
      loadTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await cmsApi.deleteTeam(id);
      loadTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleImageUpload = async (id: number, file: File) => {
    try {
      await cmsApi.uploadTeamImage(id, file);
      loadTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload');
    }
  };

  if (loading && teams.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={700}>Team Members</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel control={<Switch checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} />} label="Active Only" />
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadTeams}>Refresh</Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Member</Button>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {teams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card>
                <CardContent>
                  {team.imageUrl && (
                    <img src={team.imageUrl} alt={team.name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{team.name}</Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(team)}><Edit /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(team.id!)} color="error"><Delete /></IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{team.jobRole}</Typography>
                  {team.portfolioLink && (
                    <Button size="small" href={team.portfolioLink} target="_blank" sx={{ mb: 1 }}>Portfolio</Button>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Chip label={team.isActive ? 'Active' : 'Inactive'} color={team.isActive ? 'success' : 'default'} size="small" />
                    {team.imageUrl && (
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`img-${team.id}`}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && team.id) handleImageUpload(team.id, file);
                          }}
                        />
                        <label htmlFor={`img-${team.id}`}>
                          <IconButton component="span" size="small"><CloudUpload /></IconButton>
                        </label>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {teams.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                  No team members found
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Click "Add Member" to add your first team member
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editingTeam ? 'Edit' : 'Add'} Team Member</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Name" fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <TextField label="Job Role" fullWidth value={formData.jobRole} onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })} />
              <TextField label="Portfolio Link" fullWidth value={formData.portfolioLink} onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })} />
              <TextField label="Image URL" fullWidth value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              <TextField label="Display Order" type="number" fullWidth value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} />
              <FormControlLabel control={<Switch checked={formData.isActive ?? true} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">{editingTeam ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
};

export default Team;

