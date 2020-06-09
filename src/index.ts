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
function makeAsyncSetPropMiddleware<StateType, DispatchExt, StateExt>(): Middleware<DispatchExt, StateExt, redux.Dispatch> {
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

type StoreAction<StateType, CustomActions> = SetActionType<StateType> | CustomActions;

/**
 * Creates a Redux store.
 *
 * @template StateType The type of state to be held by the store.
 * @template CustomActions The type of actions which may be dispatched.
 * @template Ext Store extension that is mixed in to the Store type.
 * @template StateExt State extension that is mixed into the state type.
 * @param customReducer Root reducer pure function
 * @param defaultStore Initial value for the store
 * @param shouldComposeWithDevTools Whether or not apply Redux DevTools. Will apply by default if not set "false"
 * @param middlewares array of applied redux middlewares
 */
export function createStore<StateType,
    CustomActions extends Action = Action<never>,
    Ext extends { dispatch: redux.Dispatch<CustomActions> } = { dispatch: redux.Dispatch<CustomActions> },
    StateExt = Record<string, any>>(
        customReducer?: (state: StateType, action: CustomActions) => StateType,
        defaultStore?: StateType,
        shouldComposeWithDevTools?: boolean,
        middlewares?: (Middleware<Record<string, any>, StateExt>)[],
): redux.Store<StateType & StateExt, StoreAction<StateType, CustomActions>> & Ext {

    // ACTIONS 

    type CustomStoreAction = StoreAction<StateType, CustomActions>;

    // REDUCERS 

    function setterReducer(state: StateType, action: SetActionSync<StateType>): StateType {
        if ('payload' in action) {
            return Object.assign({}, state, {
                [action.prop]: action.payload
            });
        }
        else return state;
    }

    function rootReducer(state: StateType | undefined, action: CustomStoreAction): StateType {
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
    }

    // STORE

    let appliedMiddlewares: redux.StoreEnhancer<any>;
    if (middlewares) appliedMiddlewares = applyMiddleware<redux.Dispatch<CustomActions>, StateExt>(...middlewares, makeAsyncSetPropMiddleware<StateType, redux.Dispatch<CustomActions>, StateExt>());
    else appliedMiddlewares = applyMiddleware(makeAsyncSetPropMiddleware<StateType, redux.Dispatch<CustomActions>, StateExt>());

    return redux.createStore<StateType, CustomStoreAction, Ext, StateExt>(rootReducer,
        shouldComposeWithDevTools !== false ? composeWithDevTools<Ext, StateExt>(appliedMiddlewares) : appliedMiddlewares);
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
export function connect<State, TStateProps = Record<string, any>,
    TDispatchProps = Record<string, any>, TOwnProps = Record<string, any>>(
        mapStateToProps?: reactRedux.MapStateToProps<TStateProps, TOwnProps, State>,
        mapDispatchToProps?: reactRedux.MapDispatchToProps<TDispatchProps, TOwnProps>
    ): reactRedux.InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps> {
    const rootMapDispatchToProps = (dispatch: redux.Dispatch<Action>, ownProps: TOwnProps) => {
        let mdtp = {};
        if (typeof mapDispatchToProps === 'function') {
            mdtp = Object.assign({}, {
                ...(mapDispatchToProps as reactRedux.MapDispatchToPropsFunction<TDispatchProps, TOwnProps>)(
                    dispatch, ownProps)
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

export type PropsType<State = Record<string, unknown>, TOwnProps = Record<string, unknown>,
    TStateProps = Record<string, unknown>, TDispatchProps = Record<string, unknown>> =
    TStateProps & TDispatchProps & TOwnProps & {
        setStateProp: (action: DispatchActionSync<State>) => typeof action;
        setStatePropAsync: (action: DispatchActionAsync<State>) => typeof action;
    };
