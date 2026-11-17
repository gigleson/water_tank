
import "dotenv/config";

import app from "./app";
import connectDB from "./config/database";

const PORT = process.env.PORT ;

const startServer = async (): Promise<void> => {
    
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

startServer();
