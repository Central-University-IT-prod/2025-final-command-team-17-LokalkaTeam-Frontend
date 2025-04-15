const formatDate = (date: any) => {
    if (!date) return '-'
    const d = new Date(date)
    const datePart = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    const timePart = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    return `${datePart} (${timePart})`
};

export default formatDate;