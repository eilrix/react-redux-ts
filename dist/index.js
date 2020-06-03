"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.createStore = void 0;
const redux = require("redux");
const redux_1 = require("redux");
const reactRedux = require("react-redux");
const redux_devtools_extension_1 = require("redux-devtools-extension");
// ASYNC SET PROP MIDDDLEWARE //
/**
 * Redux's middleware that takes actions with provided functions.
 * Waits until returned promise resolved and then saves value to the store
 *
 * @template StateType The type of state held by the store.
 */
function makeAsyncSetPropMiddleware() {
    return (({ dispatch }) => (next) => (action) => {
        next(action);
        if (action.type === 'SET_PROP_ASYNC') {
            // Notify start request
            dispatch({
                type: 'NOTIFY_SET_PROP_ASYNC',
                prop: action.prop,
                status: 'start'
            });
            // Handle response
            action.func().then((data) => {
                // Notify success
                dispatch({
                    type: 'NOTIFY_SET_PROP_ASYNC',
                    prop: action.prop,
                    status: 'success'
                });
                // Save response to the store
                dispatch({
                    type: 'SET_PROP',
                    prop: action.prop,
                    payload: data
                });
            }, () => {
                // Notify error
                dispatch({
                    type: 'NOTIFY_SET_PROP_ASYNC',
                    prop: action.prop,
                    status: 'error'
                });
            }).finally(() => {
                // Notify end
                dispatch({
                    type: 'NOTIFY_SET_PROP_ASYNC',
                    prop: action.prop,
                    status: 'end'
                });
            });
        }
    });
}
// CREATE STORE //
/**
 * Creates a Redux store.
 *
 * @template StateType The type of state to be held by the store.
 * @template CustomActions The type of actions which may be dispatched.
 * @template Ext Store extension that is mixed in to the Store type.
 * @template StateExt State extension that is mixed into the state type.
 * @param customReducer Root reducer pure function
 * @param defaultStore Initial value for the store
 */
function createStore(customReducer, defaultStore, middlewares) {
    // ACTIONS 
    // REDUCERS 
    function setterReducer(state, action) {
        if ('payload' in action) {
            return Object.assign({}, state, {
                [action.prop]: action.payload
            });
        }
        else
            return state;
    }
    ;
    function rootReducer(state, action) {
        if (state === undefined) {
            if (defaultStore)
                state = defaultStore;
            else
                return {};
        }
        if ('type' in action && action.type === 'SET_PROP') {
            return setterReducer(state, action);
        }
        else if ('type' in action && action.type === 'SET_PROP_ASYNC') {
            // Async actions should've already been processed in middleware
            // Skip
        }
        else if (customReducer) {
            return customReducer(state, action);
        }
        return state;
    }
    ;
    // STORE
    let appliedMiddlewares;
    if (middlewares)
        appliedMiddlewares = redux_1.applyMiddleware(...middlewares, makeAsyncSetPropMiddleware());
    else
        appliedMiddlewares = redux_1.applyMiddleware(makeAsyncSetPropMiddleware());
    return redux.createStore(rootReducer, redux_devtools_extension_1.composeWithDevTools(appliedMiddlewares));
}
exports.createStore = createStore;
// REACT-REDUX CONNECT
/**
 * Returns a function used for connection react component to the store
 *
 * @template State The type of state held by the store.
 * @template TStateProps The type of the props of store's state that need to be recieved as props.
 * @template TDispatchProps The type of actions that will be used by component
 * @template TOwnProps The type of props recieved from parent component
 * @param mapStateToProps
 * @param mapDispatchToProps
 */
function connect(mapStateToProps, mapDispatchToProps) {
    const rootMapDispatchToProps = (dispatch, ownProps) => {
        let mdtp = {};
        if (typeof mapDispatchToProps === 'function') {
            mdtp = Object.assign({}, Object.assign({}, mapDispatchToProps(dispatch, ownProps)));
        }
        else if (mapDispatchToProps && mapDispatchToProps instanceof Object) {
            mdtp = Object.assign({}, Object.assign({}, mapDispatchToProps));
        }
        return Object.assign(Object.assign({}, mdtp), { setStateProp: (action) => dispatch({
                type: 'SET_PROP',
                prop: action.prop,
                payload: action.payload
            }), setStatePropAsync: (action) => dispatch({
                type: 'SET_PROP_ASYNC',
                prop: action.prop,
                func: action.func
            }) });
    };
    return reactRedux.connect(mapStateToProps, rootMapDispatchToProps);
}
exports.connect = connect;
