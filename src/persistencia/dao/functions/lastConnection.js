function calculateLastConnectionTime(lastConnection) {
    if (!lastConnection) return 'Nunca';

    const currentTime = new Date();
    const timeDiff = Math.abs(currentTime - lastConnection);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = '';
    if (days > 0) timeString += `${days} día(s) `;
    if (hours > 0) timeString += `${hours} hora(s) `;
    if (minutes > 0) timeString += `${minutes} minuto(s)`;

    return timeString;
}

export default calculateLastConnectionTime;