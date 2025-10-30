import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserDetails from './pages/UserDetails';
import Subscriptions from './pages/Subscriptions';
import SubscriptionAnalytics from './pages/SubscriptionAnalytics';
import SubscriptionDetails from './pages/SubscriptionDetails';
import ManagePlanEndpoints from './pages/ManagePlanEndpoints';
import CustomerAnalytics from './pages/CustomerAnalytics';
import PromoCodeManagement from './pages/PromoCodeManagement';
import SalesAnalytics from './pages/SalesAnalytics';
import InactiveUsers from './pages/InactiveUsers';

const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { theme: mode, primaryColor } = useTheme();
	const muiTheme = React.useMemo(
		() =>
			createTheme({
				palette: { mode, primary: { main: primaryColor } },
			}),
		[mode, primaryColor]
	);
	return (
		<MuiThemeProvider theme={muiTheme}>
			<CssBaseline />
			{children}
		</MuiThemeProvider>
	);
};

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
	const token = localStorage.getItem('token');
	if (!token) return <Navigate to="/login" replace />;
	return children;
};

const App: React.FC = () => {
	return (
		<ThemeProvider>
			<AppThemeProvider>
				<BrowserRouter
					future={{
						v7_startTransition: true,
						v7_relativeSplatPath: true,
					}}
				>
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route
							path="/dashboard"
							element={
								<PrivateRoute>
									<Dashboard />
								</PrivateRoute>
							}
						/>
						<Route
							path="/users"
							element={
								<PrivateRoute>
									<UserManagement />
								</PrivateRoute>
							}
						/>
						<Route
							path="/users/:id"
							element={
								<PrivateRoute>
									<UserDetails />
								</PrivateRoute>
							}
						/>
						<Route
							path="/subscriptions"
							element={
								<PrivateRoute>
									<Subscriptions />
								</PrivateRoute>
							}
						/>
						<Route
							path="/subscriptions/analytics"
							element={
								<PrivateRoute>
									<SubscriptionAnalytics />
								</PrivateRoute>
							}
						/>
						<Route
							path="/subscriptions/details"
							element={
								<PrivateRoute>
									<SubscriptionDetails />
								</PrivateRoute>
							}
						/>
						<Route
							path="/subscriptions/manage/:planCode"
							element={
								<PrivateRoute>
									<ManagePlanEndpoints />
								</PrivateRoute>
							}
						/>
						<Route
							path="/customers/analytics"
							element={
								<PrivateRoute>
									<CustomerAnalytics />
								</PrivateRoute>
							}
						/>
						<Route
							path="/promo-codes"
							element={
								<PrivateRoute>
									<PromoCodeManagement />
								</PrivateRoute>
							}
						/>
						<Route
							path="/sales-analytics"
							element={
								<PrivateRoute>
									<SalesAnalytics />
								</PrivateRoute>
							}
						/>
						<Route
							path="/inactive-users"
							element={
								<PrivateRoute>
									<InactiveUsers />
								</PrivateRoute>
							}
						/>
						<Route path="*" element={<Navigate to="/dashboard" replace />} />
					</Routes>
				</BrowserRouter>
			</AppThemeProvider>
		</ThemeProvider>
	);
};

export default App;
