import './App.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import theme from './common/theme/themes';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
      {/* <div>
        <h1>Admin Service - Carbon Credit Marketplace</h1>
        <p>Theme setup completed! ✅</p>
      </div> */}
    </ThemeProvider>
  );
}

export default App;
