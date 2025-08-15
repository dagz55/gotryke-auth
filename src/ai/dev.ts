// Flows will be imported for their side effects in this file.
import './genkit.ts'
import { startFlowsServer } from 'genkit'

// Start the flows server
startFlowsServer()
  .then(() => {
    console.log('Genkit flows server started')
  })
  .catch((error) => {
    console.error('Error starting Genkit flows server:', error)
  })
