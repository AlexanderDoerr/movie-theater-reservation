const sinon = require('sinon');
const chai = require('chai');
const proxyquire = require('proxyquire');
const assert = chai.assert;

describe('Movie Controller', () => {
  let movieController, grpcMock, kafkaMock, protoLoaderMock, clientStub, producerStub, movieProto;

  beforeEach(() => {
    process.env.KAFKA_BROKER_SERVER = 'mock-broker-server';

    clientStub = {
      GetMovieInfo: sinon.stub(),
      GetAllMovies: sinon.stub(),
      GetAllShowingMovies: sinon.stub(),
    };

    producerStub = {
      connect: sinon.stub(),
      send: sinon.stub(),
    };

    movieProto = {
      MovieList: sinon.stub().returns(clientStub)
    };

    grpcMock = {
      loadPackageDefinition: sinon.stub().returns({movielist: movieProto}),
      credentials: { createInsecure: sinon.stub() }
    };

    kafkaMock = {
      producer: sinon.stub().returns(producerStub)
    };

    protoLoaderMock = {
      loadSync: sinon.stub()
    };

    movieController = proxyquire('../controllers/movieListController', {
      '@grpc/grpc-js': grpcMock,
      '../stream/kafka': kafkaMock,
      '@grpc/proto-loader': protoLoaderMock,
    });
  });

  afterEach(() => {
    delete process.env.KAFKA_BROKER_SERVER;
  });

  describe('getAllMovies', () => {
    it('should return all movies', (done) => {
      const mockReq = {};
      const mockRes = {
        json: sinon.stub(),
        status: sinon.stub().returnsThis()
      };
      const mockResponse = { movies: ['Movie 1', 'Movie 2'] };

      clientStub.GetAllMovies.yields(null, mockResponse);

      movieController.getAllMovies(mockReq, mockRes);

      setImmediate(() => {
        assert(clientStub.GetAllMovies.calledOnce);
        assert(mockRes.json.calledWith(mockResponse));
        done();
      });
    });
  });

describe('getMovieInfo', () => {
    it('should return movie info', (done) => {
      const mockReq = { params: { id: '123' } };
      const mockRes = {
        json: sinon.stub(),
        status: sinon.stub().returnsThis()
      };
      const mockResponse = { title: 'Movie 1', description: 'Some description' };
  
      clientStub.GetMovieInfo.yields(null, mockResponse);
  
      movieController.getMovieInfo(mockReq, mockRes);
  
      setImmediate(() => {
        assert(clientStub.GetMovieInfo.calledWith({id: '123'}));
        assert(mockRes.json.calledWith(mockResponse));
        done();
      });
    });
  });
  
  describe('getAllShowingMovies', () => {
    it('should return all showing movies', (done) => {
      const mockReq = {};
      const mockRes = {
        json: sinon.stub(),
        status: sinon.stub().returnsThis()
      };
      const mockResponse = { movies: ['Movie 1', 'Movie 2'] };
  
      clientStub.GetAllShowingMovies.yields(null, mockResponse);
  
      movieController.getAllShowingMovies(mockReq, mockRes);
  
      setImmediate(() => {
        assert(clientStub.GetAllShowingMovies.calledOnce);
        assert(mockRes.json.calledWith(mockResponse));
        done();
      });
    });
  });
  
  describe('updateMovie', () => {
    it('should update movie', async () => {
      const mockReq = {
        params: { id: '123' },
        body: {
          title: 'New title',
          description: 'New description',
          runtime: '2h',
          rating: 5,
          is_showing: true
        }
      };
      const mockRes = {
        send: sinon.stub(),
        status: sinon.stub().returnsThis()
      };
  
      await movieController.updateMovie(mockReq, mockRes);
  
      assert(producerStub.connect.calledOnce);
      assert(producerStub.send.calledOnce);
      assert(mockRes.send.calledWith('Movie Updated'));
    });
  });
  
});


