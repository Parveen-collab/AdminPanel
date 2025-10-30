import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TablePagination, Chip, Box
} from '@mui/material';
import { subscriptionApi, UserSubscription } from '../../api/subscriptionApi';
import Loading from '../common/Loading';
import { format } from 'date-fns';

interface Props {
  userId: number;
}

const SubscriptionHistoryTab: React.FC<Props> = ({ userId }) => {
  const [data, setData] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [userId, page, size]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const req = {
        userId,
        page,
        size,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      };
      const res = await subscriptionApi.historyFiltered(req);
      setData(res.payload?.content || []);
      setTotal(res.payload?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load subscription history', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Plan</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Amount Paid</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Subscribed At</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell><Chip label={sub.planCode} size="small" /></TableCell>
                <TableCell>
                  <Chip
                    label={sub.period}
                    size="small"
                    color={sub.period === 'TRIAL' ? 'warning' : sub.period === 'MONTHLY' ? 'info' : 'success'}
                  />
                </TableCell>
                <TableCell>{sub.startDate ? format(new Date(sub.startDate), 'dd MMM yyyy') : '-'}</TableCell>
                <TableCell>{sub.endDate ? format(new Date(sub.endDate), 'dd MMM yyyy') : '-'}</TableCell>
                <TableCell>{sub.pricePaid ? `₹${sub.pricePaid}` : '-'}</TableCell>
                <TableCell>{sub.paymentTxnId || '-'}</TableCell>
                <TableCell>{sub.subscribedAt ? format(new Date(sub.subscribedAt), 'dd MMM yyyy HH:mm') : '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={sub.active ? 'Active' : 'Expired'}
                    size="small"
                    color={sub.active ? 'success' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">No subscription history</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={size}
          onRowsPerPageChange={(e) => {
            setSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Box>
    </Paper>
  );
};

export default SubscriptionHistoryTab;

