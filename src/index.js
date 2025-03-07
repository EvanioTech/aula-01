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
// middleware

function verifyIfExistsAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ error: 'Customer not found!' });
    }

    req.customer = customer;

    return next();
}
function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );
    if (customerAlreadyExists) {
        return res.status(400).json({ error: 'Customer already exists!' });
    }

    const id = uuidv4();

    customers.push({
        cpf,
        name,
        id,
        statement: []
    });

    return res.status(201).send(customers);
});

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
    
    const { customer } = req;

    return res.status(201).json(customer.statement);
}
);

app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
    const { description, amount } = req.body;

    const { customer } = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    }

    customer.statement.push(statementOperation);

    return res.status(201).send(customer);
}
);

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
    const { amount } = req.body;
    const { customer } = req;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return res.status(400).json({ error: 'Insufficient funds!' });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }

    customer.statement.push(statementOperation);

    return res.status(201).send(customer);
}
);


app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter(
        (statement) =>
            statement.created_at.toDateString() === new Date(dateFormat).toDateString()
    );

    return res.status(201).json(statement);
}
);







app.listen(3000, () => {
    console.log('Server is running on port 3000');
})