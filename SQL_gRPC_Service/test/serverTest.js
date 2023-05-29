const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('sinon-chai'));

const db = require('../DB/MySQL');
const myModule = require('../server'); // replace with the actual file path to your module

describe('MyModule', function() {
  afterEach(function() {
    // Restore the default sandbox after each test
    sinon.restore();
  });

  describe('getAllMovies', function() {
    it('should return all movies', async function() {
      const mockMovies = [
        { 
          id: '1',
          title: 'Movie 1',
          description: 'Description 1',
          runtime: 100,
          rating: 5,
          is_showing: 'true',
        },
      ];
      
      const expectedResponse = {
        movies: [
          {
            uuid: '1',
            title: 'Movie 1',
            description: 'Description 1',
            runtime: 100,
            rating: 5,
            isShowing: true,
          },
        ],
      };
      
      const findAllMoviesStub = sinon.stub(db, 'findAllMovies');
      findAllMoviesStub.resolves(mockMovies);
      
      const callback = sinon.stub();

      await myModule.getAllMovies(null, callback);
      
      expect(callback).to.have.been.calledOnceWithExactly(null, expectedResponse);
    });
  });

  describe('createUser', function() {
    it('should create a new user', async function() {
      const mockRequest = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      
      const mockExistingUsers = [];
      const mockNewUserId = '1';
      
      const expectedResponse = {
        userId: mockNewUserId,
      };
      
      const findAllUsersStub = sinon.stub(db, 'findAllUsers');
      findAllUsersStub.resolves(mockExistingUsers);
      
      const createUserStub = sinon.stub(db, 'createUser');
      createUserStub.resolves();

      const findUserByEmailStub = sinon.stub(db, 'findUserByEmail');
      findUserByEmailStub.resolves([{ id: mockNewUserId }]);
      
      const callback = sinon.stub();
      
      await myModule.createUser({ request: mockRequest }, callback);
      
      expect(callback).to.have.been.calledOnceWithExactly(null, expectedResponse);
      expect(createUserStub).to.have.been.calledOnceWithExactly(
        mockRequest.firstname,
        mockRequest.lastname,
        mockRequest.email,
        mockRequest.password
      );
    });
  });
});
