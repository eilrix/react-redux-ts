import * as redux from "redux";
import { Action, applyMiddleware, Middleware } from "redux";
import { composeWithDevTools } from 'redux-devtools-extension';
import { SetActionType, SetActionSync } from './types';
import { makeAsyncSetPropMiddleware } from './asyncSetPropMiddleware';

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