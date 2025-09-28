import { useState, useCallback } from 'react'

interface UsePaginationProps {
  initialPage?: number
  initialSize?: number
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
}

export const usePagination = ({
  initialPage = 0,
  initialSize = 20,
  initialSortBy = 'id',
  initialSortOrder = 'asc',
}: UsePaginationProps = {}) => {
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)
  
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])
  
  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize)
    setPage(0) // Reset to first page when changing size
  }, [])
  
  const handleSortChange = useCallback((field: string) => {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(0) // Reset to first page when changing sort
  }, [sortBy])
  
  const reset = useCallback(() => {
    setPage(initialPage)
    setSize(initialSize)
    setSortBy(initialSortBy)
    setSortOrder(initialSortOrder)
  }, [initialPage, initialSize, initialSortBy, initialSortOrder])
  
  return {
    page,
    size,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSizeChange,
    handleSortChange,
    reset,
    paginationProps: {
      page,
      size,
      sortBy,
      sortOrder,
    },
  }
}