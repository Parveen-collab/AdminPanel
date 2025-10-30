import React, { useEffect, useState } from 'react';
import { Box, Paper, Stack, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, Button } from '@mui/material';
import Layout from '../components/Layout/Layout';
import { subscriptionApi, UserSubscription } from '../api/subscriptionApi';
import Loading from '../components/common/Loading';
import { format } from 'date-fns';

const SubscriptionDetails: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [current, setCurrent] = useState<UserSubscription[]>([]);
  const [history, setHistory] = useState<any>({ content: [], totalElements: 0 });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [currRes, histRes] = await Promise.all([
        subscriptionApi.current(userId),
        subscriptionApi.history(userId, 0, 50)
      ]);
      setCurrent(currRes.payload || []);
      setHistory(histRes.payload || { content: [], totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>User Subscription Details</Typography>

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="User ID" type="number" size="small" value={userId || ''} onChange={e => setUserId(Number(e.target.value) || null)} />
            <Button variant="contained" onClick={loadData} disabled={!userId}>Load</Button>
          </Stack>
        </Paper>

        {loading && <Loading />}

        {userId && !loading && (
          <>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={700}>Active Subscriptions</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Plan</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Amount Paid</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {current.map(s => (
                    <TableRow key={s.id}>
                      <TableCell><Chip label={s.planCode} /> {s.planNameSnapshot}</TableCell>
                      <TableCell>{s.period}</TableCell>
                      <TableCell>{format(new Date(s.startDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{format(new Date(s.endDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell>₹{s.pricePaid || 0}</TableCell>
                      <TableCell><Chip label={s.active ? 'Active' : 'Inactive'} color={s.active ? 'success' : 'default'} size="small" /></TableCell>
                    </TableRow>
                  ))}
                  {current.length === 0 && <TableRow><TableCell colSpan={6} align="center">No active subscriptions</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={700}>Subscription History</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Plan</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Subscribed At</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Txn ID</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.content?.map((s: UserSubscription) => (
                    <TableRow key={s.id}>
                      <TableCell><Chip label={s.planCode} size="small" /> {s.planNameSnapshot}</TableCell>
                      <TableCell>{s.period}</TableCell>
                      <TableCell>{s.subscribedAt ? format(new Date(s.subscribedAt), 'dd MMM yyyy HH:mm') : '-'}</TableCell>
                      <TableCell>{format(new Date(s.startDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{format(new Date(s.endDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell>₹{s.pricePaid || 0}</TableCell>
                      <TableCell>{s.paymentTxnId || '-'}</TableCell>
                      <TableCell><Chip label={s.active ? 'Active' : 'Expired'} color={s.active ? 'success' : 'default'} size="small" /></TableCell>
                    </TableRow>
                  ))}
                  {(!history.content || history.content.length === 0) && <TableRow><TableCell colSpan={8} align="center">No history</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}
      </Stack>
    </Layout>
  );
};

export default SubscriptionDetails;

