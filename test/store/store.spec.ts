import { createStore } from '../../src';
import { expect } from 'chai';
import 'mocha';

describe('Initial state test', () => {

    it('should return same initial state', () => {
        const store = createStore(undefined, 'str');
        expect(store.getState()).to.equal('str');
    });

    it('should return same initial state', () => {
        const store = createStore(undefined, 1);
        expect(store.getState()).to.equal(1);
    });

});