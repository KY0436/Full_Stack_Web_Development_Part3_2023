const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://yanj19:${password}@cluster0.1vkbkge.mongodb.net/Phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)


// Define the Phone schema with two fields
const phoneScenma = new mongoose.Schema({
  name: String,
  number: String,
})

// Define the Phone model
const Phone = mongoose.model('Phone', phoneScenma)

if( process.argv.length === 5){
  const phone = new Phone(
    {
      name: process.argv[3],
      number:  process.argv[4],
    }
  )
  phone.save().then(result => {
    console.log('Phone saved!')
    // Close the connection between Mongo and phonebook application
    mongoose.connection.close()
  })
}

if( process.argv.length === 3){
  Phone
  .find({})
  .then(result=> {
    console.log("phonebook:")
    result.forEach(note => {
      console.log(`${note.name} ${note.number} `)
    })
    // Close the connection between Mongo and phonebook application
    mongoose.connection.close()
  })
}



