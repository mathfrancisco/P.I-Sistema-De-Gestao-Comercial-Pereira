import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ptBR } from 'date-fns/locale'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './routes'
import { theme } from './styles/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (novo nome para cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
})

const globalStyles = (
  <GlobalStyles
    styles={{
      '*': {
        boxSizing: 'border-box',
      },
      html: {
        height: '100%',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      body: {
        height: '100%',
        margin: 0,
        padding: 0,
        backgroundColor: '#FAFBFF',
        color: '#1E293B',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        lineHeight: 1.6,
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
      },
      '#root': {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
      a: {
        color: '#3B82F6',
        textDecoration: 'none',
        fontWeight: 500,
        '&:hover': {
          color: '#1E40AF',
          textDecoration: 'underline',
        },
      },
      // Scrollbar customization
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: '#F1F5F9',
        borderRadius: '4px',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#CBD5E1',
        borderRadius: '4px',
        '&:hover': {
          background: '#94A3B8',
        },
      },
      // Selection color
      '::selection': {
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
      },
      // Focus outline para acessibilidade
      '*:focus-visible': {
        outline: '2px solid #3B82F6',
        outlineOffset: '2px',
      },
    }}
  />
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <CssBaseline />
          {globalStyles}
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#FFFFFF',
                  color: '#1E293B',
                  border: '1px solid #E3F2FD',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15)',
                  fontWeight: 500,
                  fontSize: '14px',
                  padding: '16px',
                },
                success: {
                  style: {
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #6EE7B7',
                  },
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  style: {
                    background: '#FEF2F2',
                    color: '#991B1B',
                    border: '1px solid #FECACA',
                  },
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
                loading: {
                  style: {
                    background: '#EBF8FF',
                    color: '#1E40AF',
                    border: '1px solid #93C5FD',
                  },
                  iconTheme: {
                    primary: '#3B82F6',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
          </BrowserRouter>
          <ReactQueryDevtools 
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App