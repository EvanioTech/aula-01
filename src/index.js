import express from 'express';
import { v4 as uuidv4 } from 'uuid';


const app = express();

app.use(express.json());

const customers = [];

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    const id = uuidv4();

    customers.push({
        cpf,
        name,
        id,
        statement: []
    });

    return res.status(201).send(customers);
});








app.listen(3000, () => {
    console.log('Server is running on port 3000');
})