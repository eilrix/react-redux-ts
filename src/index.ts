import * as redux from "redux";
import { Action, applyMiddleware, Middleware } from "redux";
import * as reactRedux from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';

// DEFAULT "SET ACTIONS" DEFINITIONS //

type SetActionSync<StateType> = { [K in keyof StateType]: {
    type: 'SET_PROP';
    prop: K;
    payload: StateType[K];
} }[keyof StateType];

type SetActionAsync<StateType> = { [K in keyof StateType]: {
    type: 'SET_PROP_ASYNC';
    prop: K;
    func: () => Promise<StateType[K]>;
} }[keyof StateType];


type AsyncStatus = 'start' | 'error' | 'success' | 'end';

type NotifySetActionAsync<StateType> = { [K in keyof StateType]: {
    type: 'NOTIFY_SET_PROP_ASYNC';
    prop: K;
    status: AsyncStatus;
    response?: StateType[K];
} }[keyof StateType];

export type SetActionType<S> = SetActionSync<S> | SetActionAsync<S> | NotifySetActionAsync<S>;



type DispatchActionSync<StateType> = { [K in keyof StateType]: {
    prop: K;
    payload: StateType[K];
} }[keyof StateType];

type DispatchActionAsync<StateType> = { [K in keyof StateType]: {
    prop: K;
    func: () => Promise<StateType[K]>;
} }[keyof StateType];


// ASYNC SET PROP MIDDDLEWARE //

/**
 * Redux's middleware that takes actions with provided functions. 
 * Waits until returned promise resolved and then saves value to the store
 *
 * @template StateType The type of state held by the store.
 */
function makeAsyncSetPropMiddleware<StateType>(): Middleware<{}, StateType, redux.Dispatch> {
    type ActionType = SetActionType<StateType>;
    return (
        ({ dispatch }: { dispatch: redux.Dispatch<ActionType> }) => (next: redux.Dispatch<ActionType>) => (action: ActionType) => {
            next(action);
            if (action.type === 'SET_PROP_ASYNC') {
                // Notify start request
                dispatch({
                    type: 'NOTIFY_SET_PROP_ASYNC',
                    prop: action.prop,
                    status: 'start'
                });
                // Handle response
                action.func().then((data: StateType[keyof StateType]) => {
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
                    })
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
                })
            }
        }
    )
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
export function createStore<StateType extends Object,
    CustomActions extends Action = Action<never>,
    Ext = {}, StateExt = {}>(
        customReducer?: (state: StateType, action: CustomActions) => StateType,
        defaultStore?: StateType,
        middlewares?: (Middleware<any, StateType, any>)[],
) {

    // ACTIONS 

    type StoreAction = SetActionType<StateType> | CustomActions;

    // REDUCERS 

    function setterReducer(state: StateType, action: SetActionSync<StateType>): StateType {
        if ('payload' in action) {
            return Object.assign({}, state, {
                [action.prop]: action.payload
            });
        }
        else return state;
    };

    function rootReducer(state: StateType | undefined, action: StoreAction): StateType {
        if (state === undefined) {
            if (defaultStore) state = defaultStore;
            else return {} as StateType;
        }

        if ('type' in action && action.type === 'SET_PROP') {
            return setterReducer(state, action as SetActionSync<StateType>);
        }
        else if ('type' in action && action.type === 'SET_PROP_ASYNC') {
            // Async actions should've already been processed in middleware

            // Skip
        }
        else if (customReducer) {
            return customReducer(state, action as CustomActions);
        }

        return state;
    };


    // STORE



    let appliedMiddlewares;
    if (middlewares) appliedMiddlewares = applyMiddleware(...middlewares, makeAsyncSetPropMiddleware<StateType>());
    else appliedMiddlewares = applyMiddleware(makeAsyncSetPropMiddleware<StateType>());

    return redux.createStore<StateType, StoreAction, Ext, StateExt>(rootReducer, composeWithDevTools<Ext, StateExt>(appliedMiddlewares));
}


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
export function connect<State, TStateProps = {}, TDispatchProps = {}, TOwnProps = {}>(
    mapStateToProps?: reactRedux.MapStateToProps<TStateProps, TOwnProps, State>,
    mapDispatchToProps?: reactRedux.MapDispatchToProps<TDispatchProps, TOwnProps>
) {

    type ActionType = SetActionType<State>;



    const rootMapDispatchToProps = (dispatch, ownProps) => {
        let mdtp = {};
        if (typeof mapDispatchToProps === 'function') {
            mdtp = Object.assign({}, {
                ...(mapDispatchToProps as reactRedux.MapDispatchToPropsFunction<TDispatchProps, TOwnProps>)(
                    dispatch as redux.Dispatch<Action>, ownProps)
            });
        }
        else if (mapDispatchToProps && mapDispatchToProps instanceof Object) {
            mdtp = Object.assign({}, { ...mapDispatchToProps });
        }

        return {
            ...mdtp,
            setStateProp: (action: DispatchActionSync<State>) => dispatch({
                type: 'SET_PROP',
                prop: action.prop,
                payload: action.payload
            }),
            setStatePropAsync: (action: DispatchActionAsync<State>) => dispatch({
                type: 'SET_PROP_ASYNC',
                prop: action.prop,
                func: action.func
            })
        }
    }

    return reactRedux.connect(mapStateToProps, rootMapDispatchToProps);
}

export type PropsType<State = {}, TOwnProps = {}, TStateProps = {}, TDispatchProps = {}> =
    TStateProps & TDispatchProps & TOwnProps & {
        setStateProp: (action: DispatchActionSync<State>) => typeof action;
        setStatePropAsync: (action: DispatchActionAsync<State>) => typeof action;
    };
