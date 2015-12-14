
import express from 'express';
import { response } from 'controllers/utils';

let router = express.Router();

router.all('*', (req, res) => {
    response(res, {
        status: 404
    });
});

export default router;
