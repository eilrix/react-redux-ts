import * as redux from "redux";
import { Action, Middleware } from "redux";
import * as reactRedux from 'react-redux';
declare type SetActionSync<StateType> = {
    [K in keyof StateType]: {
        type: 'SET_PROP';
        prop: K;
        payload: StateType[K];
    };
}[keyof StateType];
declare type SetActionAsync<StateType> = {
    [K in keyof StateType]: {
        type: 'SET_PROP_ASYNC';
        prop: K;
        func: () => Promise<StateType[K]>;
    };
}[keyof StateType];
declare type AsyncStatus = 'start' | 'error' | 'success' | 'end';
declare type NotifySetActionAsync<StateType> = {
    [K in keyof StateType]: {
        type: 'NOTIFY_SET_PROP_ASYNC';
        prop: K;
        status: AsyncStatus;
        response?: StateType[K];
    };
}[keyof StateType];
export declare type SetActionType<S> = SetActionSync<S> | SetActionAsync<S> | NotifySetActionAsync<S>;
declare type DispatchActionSync<StateType> = {
    [K in keyof StateType]: {
        prop: K;
        payload: StateType[K];
    };
}[keyof StateType];
declare type DispatchActionAsync<StateType> = {
    [K in keyof StateType]: {
        prop: K;
        func: () => Promise<StateType[K]>;
    };
}[keyof StateType];
declare type StoreAction<StateType, CustomActions> = SetActionType<StateType> | CustomActions;
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
export declare function createStore<StateType, CustomActions extends Action = Action<never>, Ext extends {
    dispatch: redux.Dispatch<CustomActions>;
} = {
    dispatch: redux.Dispatch<CustomActions>;
}, StateExt = Record<string, any>>(customReducer?: (state: StateType, action: CustomActions) => StateType, defaultStore?: StateType, shouldComposeWithDevTools?: boolean, middlewares?: (Middleware<Record<string, any>, StateExt>)[]): redux.Store<StateType & StateExt, StoreAction<StateType, CustomActions>> & Ext;
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
export declare function connect<State, TStateProps = Record<string, any>, TDispatchProps = Record<string, any>, TOwnProps = Record<string, any>>(mapStateToProps?: reactRedux.MapStateToProps<TStateProps, TOwnProps, State>, mapDispatchToProps?: reactRedux.MapDispatchToProps<TDispatchProps, TOwnProps>): reactRedux.InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>;
export declare type PropsType<State = Record<string, unknown>, TOwnProps = Record<string, unknown>, TStateProps = Record<string, unknown>, TDispatchProps = Record<string, unknown>> = TStateProps & TDispatchProps & TOwnProps & {
    setStateProp: (action: DispatchActionSync<State>) => typeof action;
    setStatePropAsync: (action: DispatchActionAsync<State>) => typeof action;
};
export {};
