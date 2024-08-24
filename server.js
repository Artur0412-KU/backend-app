const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true}))

const dbConfig = require('./config/database.config')
const mongoose = require('mongoose');
const user = require('./model/user');

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url).then(() => {
    console.log('Databse Connected Successfully!!')
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err)
    process.exit();
})

const serverError = (err, res) => {
    if (err) {
        return res.status(500).json({message: err.message});
    }
}

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.json({'message': 'Hello, world!'})
})

app.post('/users', async (req, res) => {  // create a new user   
    try {
        const newUser = req.body;
        const User =  await user.create({
            name: newUser.name,
            email: newUser.email,
            password: newUser.password
        })

        if (!User) {
            return res.status(400).send({ message: 'User not found.' });
        }

        return res.status(201).json(User)
    } catch (err) {
        console.error('Error creating User: ', err.message)
        serverError(err, res)
    }
})

app.get('/users', async (req, res) => {  // read a users list
    try {
        const users = await user.find();
        return res.status(200).json(users)
    } catch (err) {
        console.error('Error searching User: ', err.message)
        serverError(err, res)
    }
})

app.put('/users/:id', async (req, res) => {
    try {
        const {email} = req.body;
        const UserId = req.params.id;
        const User = await user.findByIdAndUpdate(UserId, {email}, {new: true});
        if (!User) {
          return res.status(404).json({ message: 'Task not found' });
        }
        return res.status(200).json(User);
    } catch (err) {
        console.error('Error updating Task: ', err.message)
        serverError(err, res)
    }
})

app.delete('/users/:id', async (req, res) => {
    try {
        const UserId = req.params.id;
        const User = await user.findByIdAndDelete(UserId);

        if(!User) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(204).send()
    } catch (err) {
        console.error('Error deleting Task: ', err.message);
        serverError(err, res);
    }
})

app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`)
})