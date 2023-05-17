const axios = require('axios');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
app.use(express.json());

// Define path to your .proto file that defines the service
const PROTO_PATH = __dirname + '/path/to/your/proto/file.proto';

let movieListService;

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const movieListProto = grpc.loadPackageDefinition(packageDefinition).movielist;

// Define GRPC client for Movie List service
function createGrpcClient() {
  movieListService = new notes.NoteService('localhost:50051', grpc.credentials.createInsecure());
}

// Fetch movie info from Movie List service
function getMovieInfo(movieId) {
  return new Promise((resolve, reject) => {
    movieListService.GetMovieInfo({ id: movieId }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

// Initialize the GRPC client
createGrpcClient();

// Endpoint to get movie schedule
app.get('/schedule/:movieId', async (req, res) => {
  const movieId = req.params.movieId;

  try {
    // Fetch movie info from Movie List service
    const movieInfo = await getMovieInfo(movieId);

    // Fetch seat availability
    const seatAvailabilityResponse = await axios.get(`http://seat-availability-service/availability/${movieId}`);

    // Combine movie info and seat availability
    const schedule = {
      movieInfo,
      seatAvailability: seatAvailabilityResponse.data
    };

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching the schedule.');
  }
});

