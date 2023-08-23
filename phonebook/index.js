require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Phone = require('./models/phone')


morgan.token('body', function (req) {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))
app.use(cors())


let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]


app.get('/api/persons', (request, response) => {
  Phone.find({}).then(notes => {
    //response.write('<h1>Phone Book</h1>')
    response.json(notes)
  })
})

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

// Exercise 3.1
/*
app.get('/api/persons', (req, res) => {
  res.json(persons)
})*/

// Exercise 3.2
/*
app.get('/info', (req, res) => {
  res.send('<p>Phone book has book for '+ persons.length +' people </p> <br>'
  +new Date()+'(Eastern Euorpean Standard Time) <br>')
})*/

app.get('/info', (req, res) => {
  Phone.find({}).then(results => {
    res.send('<p>Phone book has book for '+ results.length +' people </p> <br>'
    +new Date()+'(Eastern Euorpean Standard Time) <br>')
  })

})

// Exercise 3.5
/*
const generateId = () => {
  const maxId = persons.length > 0
    ? persons.length
    : 0
  return maxId + 1
}*/

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const check_name = persons.find(n => n.name===body.name)

  if(check_name){
    return response.status(405).json(
      {
        error: 'name must be unique'
      }
    )
  }

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const newPerson = new Phone({
    //id: Math.floor(Math.random() * (100000 - generateId()) + generateId()),
    name: body.name,
    number: body.number,
  })

  //persons = persons.concat(person)

  //response.json(person)

  newPerson.save().then(savedNote => {
    response.json(savedNote)
  })
  .catch((error) => next(error));

})

// Exercise 3.3 
/*
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = persons.find(person => person.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }

})
*/


app.get('/api/persons/:id', (request, response, next) => {
  Phone.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})

// Exercise 3.4
/*
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})*/

// Delete the person on phonebook
app.delete('/api/persons/:id', (request, response, next) => {
  Phone.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// Update the information on phone
app.put('/api/persons/:id', (request, response, next) => {
  const updatedPerson = request.body

  Phone.findByIdAndUpdate(request.params.id,
    { name: updatedPerson.name, number: updatedPerson.number},
    { new: true, runValidators: true, upsert: true })
    .then(updatedPhone => {
      response.json(updatedPhone)
    }
    )
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})