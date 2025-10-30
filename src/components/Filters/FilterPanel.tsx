import React from 'react';
import { Grid, TextField, MenuItem, Button, Stack, useMediaQuery, useTheme, Collapse } from '@mui/material';
import { AdminUserFilterRequest } from '../../api/adminUserApi';

interface Props {
	value: AdminUserFilterRequest;
	onChange: (next: AdminUserFilterRequest) => void;
	onSearch: () => void;
	onReset: () => void;
	expanded?: boolean; // New prop to control expansion
}

const months = [
	{ value: 1, label: 'January' },
	{ value: 2, label: 'February' },
	{ value: 3, label: 'March' },
	{ value: 4, label: 'April' },
	{ value: 5, label: 'May' },
	{ value: 6, label: 'June' },
	{ value: 7, label: 'July' },
	{ value: 8, label: 'August' },
	{ value: 9, label: 'September' },
	{ value: 10, label: 'October' },
	{ value: 11, label: 'November' },
	{ value: 12, label: 'December' },
];

const FilterPanel: React.FC<Props> = ({ value, onChange, onSearch, onReset, expanded = false }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const controlHeight = isMobile ? 44 : 56;

	const handle = (k: keyof AdminUserFilterRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ ...value, [k]: e.target.value });
	};

	return (
		<Stack spacing={2}>
			<Collapse in={expanded}>
				<Grid container spacing={2}>
				<Grid item xs={6} md={2}>
					<TextField 
						label="State" 
						fullWidth 
						value={value.state || ''} 
						onChange={handle('state')} 
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					/>
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField 
						label="Location" 
						fullWidth 
						value={value.location || ''} 
						onChange={handle('location')} 
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					/>
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField 
						label="Pincode" 
						fullWidth 
						value={value.pincode || ''} 
						onChange={handle('pincode')} 
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					/>
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField 
						label="Referral Code" 
						fullWidth 
						value={value.referralCode || ''} 
						onChange={handle('referralCode')} 
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					/>
				</Grid>
				<Grid item xs={6} md={1}>
					<TextField 
						label="Year" 
						type="number" 
						fullWidth 
						value={value.year || ''} 
						onChange={handle('year')} 
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					/>
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField 
						select 
						label="Month" 
						fullWidth 
						value={value.month || ''} 
						onChange={handle('month') as any}
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					>
						{months.map((m) => (
							<MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
						))}
					</TextField>
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField 
						label="Start Date" 
						type="date" 
						fullWidth 
						InputLabelProps={{ shrink: true }} 
						value={value.startDate || ''} 
						onChange={handle('startDate')} 
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					/>
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField 
						label="End Date" 
						type="date" 
						fullWidth 
						InputLabelProps={{ shrink: true }} 
						value={value.endDate || ''} 
						onChange={handle('endDate')} 
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					/>
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField 
						label="Sort By" 
						fullWidth 
						value={value.sortBy || 'CreationDate'} 
						onChange={handle('sortBy')} 
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					/>
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField 
						select 
						label="Direction" 
						fullWidth 
						value={value.sortDirection || 'DESC'} 
						onChange={handle('sortDirection') as any}
						size={isMobile ? 'small' : 'medium'}
						sx={{ '& .MuiInputBase-root': { height: controlHeight } }}
					>
						<MenuItem value="ASC">ASC</MenuItem>
						<MenuItem value="DESC">DESC</MenuItem>
					</TextField>
				</Grid>
			</Grid>
			</Collapse>
			<Stack direction="row" spacing={2} justifyContent="center">
				<Button variant="contained" onClick={onSearch} size={isMobile ? 'small' : 'medium'} sx={{ height: controlHeight }}>
					Search
				</Button>
				<Button variant="text" onClick={onReset} size={isMobile ? 'small' : 'medium'} sx={{ height: controlHeight }}>
					Reset
				</Button>
			</Stack>
		</Stack>
	);
};

export default FilterPanel;
