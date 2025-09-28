import React from 'react'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Stack,
} from '@mui/material'
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, pb: 0 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              
              return (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <Typography sx={{ mx: 1, color: '#CBD5E1' }}>
                      /
                    </Typography>
                  )}
                  {isLast || !item.path ? (
                    <Typography 
                      sx={{ 
                        color: '#1E293B', 
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      {item.label}
                    </Typography>
                  ) : (
                    <Typography
                      component="button"
                      onClick={() => navigate(item.path!)}
                      sx={{
                        color: '#64748B',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        '&:hover': {
                          color: '#4F46E5',
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        </Box>
      )}
      
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: '#1E293B',
              fontSize: { xs: '24px', sm: '32px' }
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748B',
                mt: 1,
                fontSize: '16px'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};