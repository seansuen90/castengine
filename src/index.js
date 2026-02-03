import express from 'express';

app.get('/', (req, res) => {
    res.send('Hello from express server!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});