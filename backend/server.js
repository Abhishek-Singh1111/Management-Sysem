const { app, pool } = require('./app');

const port = Number(process.env.PORT || 5000);

const server = app.listen(port, () => {
    console.log(`Backend API listening on http://localhost:${port}`);
});

const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down.`);
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
