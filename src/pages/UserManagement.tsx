import React, { useState } from 'react';
import { Stack, Typography, Paper, Alert, Box, TextField, Button, InputAdornment, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import FilterPanel from '../components/Filters/FilterPanel';
import UserTable from '../components/UserManagement/UserTable';
import Loading from '../components/common/Loading';
import { adminUserApi, AdminUserFilterRequest } from '../api/adminUserApi';

const defaultFilters: AdminUserFilterRequest = {
	page: 0,
	size: 10,
	sortBy: 'CreationDate',
	sortDirection: 'DESC',
};

const UserManagement: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const controlHeight = isMobile ? 44 : 56;
	const [filters, setFilters] = useState<AdminUserFilterRequest>(defaultFilters);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [data, setData] = useState<any>({ content: [], totalElements: 0 });
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

	const fetchData = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await adminUserApi.getAllUsers(filters);
			setData(res.payload || { content: [], totalElements: 0 });
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to fetch users');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters.page, filters.size, filters.sortBy, filters.sortDirection]);

	const handleSearch = () => {
		setFilters({ ...filters, page: 0 });
	};

	const handleReset = () => {
		setFilters(defaultFilters);
	};

	const handleFilterChange = (field: keyof AdminUserFilterRequest, value: any) => {
		setFilters(prev => ({ ...prev, [field]: value }));
	};

	return (
		<Layout>
			<Stack spacing={3}>
				<Typography variant="h5" fontWeight={700}>
					User Management
				</Typography>
				
				<Paper sx={{ p: 2 }}>
					<Stack spacing={2}>
						<Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems={isMobile ? 'stretch' : 'center'}>
							<TextField
								label="Search"
								placeholder="Shop ID, Name, Email, Phone, GST, Aadhar..."
								fullWidth
								value={filters.search || ''}
								onChange={(e) => handleFilterChange('search', e.target.value)}
								onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
								size={isMobile ? 'small' : 'medium'}
								InputProps={{
									startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
									endAdornment: filters.search ? (
										<InputAdornment position="end">
											<IconButton onClick={() => handleFilterChange('search', '')} edge="end" size="small">
												<ClearIcon />
											</IconButton>
										</InputAdornment>
									) : null,
								}}
								sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
							/>
							<Button
								variant={showAdvancedFilters ? 'contained' : 'outlined'}
								startIcon={<FilterIcon />}
								onClick={() => setShowAdvancedFilters(prev => !prev)}
								size={isMobile ? 'small' : 'medium'}
								sx={{ flexShrink: 0, height: controlHeight }}
							>
								{showAdvancedFilters ? 'Hide' : 'Filters'}
							</Button>
						</Stack>

						<FilterPanel
							value={filters}
							onChange={setFilters}
							onSearch={handleSearch}
							onReset={handleReset}
							expanded={showAdvancedFilters}
						/>
					</Stack>
				</Paper>

				{error && (
					<Alert severity="error" onClose={() => setError('')}>
						{error}
					</Alert>
				)}

				{loading ? (
					<Loading message="Loading users..." />
				) : (
					<UserTable
						data={data}
						page={filters.page || 0}
						size={filters.size || 10}
						onPageChange={(p) => setFilters({ ...filters, page: p })}
						onSizeChange={(s) => setFilters({ ...filters, size: s, page: 0 })}
					/>
				)}
			</Stack>
		</Layout>
	);
};

export default UserManagement;
