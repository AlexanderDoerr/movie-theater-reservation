const sinon = require('sinon');
const chai = require('chai');
const proxyquire = require('proxyquire');

const expect = chai.expect;

describe('Controller', function() {
    let controller;
    let grpcClientStub;
    let reqStub = {}, resStub = {};

    beforeEach(function() {
        // Setup the behavior of gRPC client
        grpcClientStub = {
            GetMovieInfo: sinon.stub(),
            GetAllMovies: sinon.stub(),
            GetAllShowingMovies: sinon.stub()
        };

        // Setup the response object with a stub for .status().send()
        resStub = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub()
        };

        controller = proxyquire.noCallThru().load('../controllers/movieListController.js', {
            '@grpc/grpc-js': {
                credentials: {
                    createInsecure: sinon.stub()
                },
                MovieList: function() {
                    return grpcClientStub;
                }
            },
            '../stream/kafka': {}  // Add this line to prevent requiring the actual kafka module
        });
    });

    afterEach(function() {
        // Clean up your stubs after each test
        grpcClientStub.GetMovieInfo.reset();
        grpcClientStub.GetAllMovies.reset();
        grpcClientStub.GetAllShowingMovies.reset();
        resStub.status.reset();
        resStub.send.reset();
    });

    // Your test cases here
    it('should get all movies', function(done) {
        // Configure your stubs for this test
        grpcClientStub.GetAllMovies.callsArgWith(1, null, { movies: ['movie1', 'movie2'] });

        resStub.json = function(data) {
            expect(data).to.deep.equal({ movies: ['movie1', 'movie2'] });
            done();
        }

        controller.getAllMovies(reqStub, resStub);
    });

    it('should get movie info', function(done) {
        grpcClientStub.GetMovieInfo.callsArgWith(1, null, { id: 1, title: "Test Movie" });

        resStub.json = function(data) {
            expect(data).to.deep.equal({ id: 1, title: "Test Movie" });
            done();
        }

        reqStub.params = { id: 1 };
        controller.getMovieInfo(reqStub, resStub);
    });

    it('should get all showing movies', function(done) {
        grpcClientStub.GetAllShowingMovies.callsArgWith(1, null, { movies: ['movie1', 'movie2'] });

        resStub.json = function(data) {
            expect(data).to.deep.equal({ movies: ['movie1', 'movie2'] });
            done();
        }

        controller.getAllShowingMovies(reqStub, resStub);
    });
});
