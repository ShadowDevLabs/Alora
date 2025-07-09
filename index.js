import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(import.meta.dirname, 'public')));



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
