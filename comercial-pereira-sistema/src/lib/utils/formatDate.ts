export const formatDateTime = (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        if (isNaN(dateObj.getTime())) {
            return 'Data inválida';
        }
        
        return dateObj.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };