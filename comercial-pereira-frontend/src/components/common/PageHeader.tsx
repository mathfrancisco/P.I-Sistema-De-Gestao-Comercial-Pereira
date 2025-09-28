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
  label: string
  path?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  const navigate = useNavigate()

  return (
    <Box mb={3}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            
            if (isLast || !item.path) {
              return (
                <Typography key={index} color="text.primary">
                  {item.label}
                </Typography>
              )
            }
            
            return (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigate(item.path!)
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </Breadcrumbs>
      )}
      
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" mt={1}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Box>
            {actions}
          </Box>
        )}
      </Stack>
    </Box>
  )
}