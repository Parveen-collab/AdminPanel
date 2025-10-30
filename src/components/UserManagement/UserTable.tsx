import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';

interface UserRow {
	id: number;
	shopId: string;
	shopStoreName: string;
	email: string;
	GSTNumber?: string;
	phone: string;
	AdhaarNumber: string;
	referralCode?: string;
	CreationDate?: string;
	shopAddress?: {
		state?: string;
		city?: string;
		location?: string;
		pincode?: string;
	};
}

interface Props {
    data: { content: UserRow[]; totalElements: number };
    page: number;
    size: number;
    onPageChange: (nextPage: number) => void;
    onSizeChange: (nextSize: number) => void;
}

const UserTable: React.FC<Props> = ({ data, page, size, onPageChange, onSizeChange }) => {
	const navigate = useNavigate();
	return (
		<Paper>
			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow>
                            <TableCell sx={{ width: 72 }}>#</TableCell>
							<TableCell>Shop ID</TableCell>
							<TableCell>Store Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>GST</TableCell>
							<TableCell>Aadhar</TableCell>
							<TableCell>Referral</TableCell>
							<TableCell>State</TableCell>
							<TableCell>City</TableCell>
							<TableCell>Pincode</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
                        {data.content.map((u, idx) => (
							<TableRow
								key={u.id}
								hover
								onClick={() => navigate(`/users/${u.id}`)}
                                sx={{ cursor: 'pointer', '&:hover td': { backgroundColor: 'action.hover' } }}
							>
                                <TableCell>{page * size + idx + 1}</TableCell>
								<TableCell>{u.shopId}</TableCell>
								<TableCell>{u.shopStoreName}</TableCell>
								<TableCell>{u.email}</TableCell>
								<TableCell>{u.phone}</TableCell>
								<TableCell>{u.GSTNumber || '-'}</TableCell>
								<TableCell>{u.AdhaarNumber}</TableCell>
								<TableCell>{u.referralCode || '-'}</TableCell>
								<TableCell>{u.shopAddress?.state || '-'}</TableCell>
								<TableCell>{u.shopAddress?.city || '-'}</TableCell>
								<TableCell>{u.shopAddress?.pincode || '-'}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				component="div"
				count={data.totalElements}
				page={page}
				onPageChange={(_, p) => onPageChange(p)}
				rowsPerPage={size}
				onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
				rowsPerPageOptions={[10, 20, 50]}
			/>
		</Paper>
	);
};

export default UserTable;
