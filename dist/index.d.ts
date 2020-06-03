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
export declare function createStore<StateType extends Object, CustomActions extends Action = Action<never>, Ext = {}, StateExt = {}>(customReducer?: (state: StateType, action: CustomActions) => StateType, defaultStore?: StateType, middlewares?: (Middleware<any, StateType, any>)[]): redux.Store<StateType & StateExt, CustomActions | { [K in keyof StateType]: {
    type: "SET_PROP";
    prop: K;
    payload: StateType[K];
}; }[keyof StateType] | { [K_1 in keyof StateType]: {
    type: "SET_PROP_ASYNC";
    prop: K_1;
    func: () => Promise<StateType[K_1]>;
}; }[keyof StateType] | { [K_2 in keyof StateType]: {
    type: "NOTIFY_SET_PROP_ASYNC";
    prop: K_2;
    status: AsyncStatus;
    response?: StateType[K_2];
}; }[keyof StateType]> & Ext;
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
export declare function connect<State, TStateProps = {}, TDispatchProps = {}, TOwnProps = {}>(mapStateToProps?: reactRedux.MapStateToProps<TStateProps, TOwnProps, State>, mapDispatchToProps?: reactRedux.MapDispatchToProps<TDispatchProps, TOwnProps>): reactRedux.InferableComponentEnhancerWithProps<TStateProps & {
    setStateProp: (action: DispatchActionSync<State>) => any;
    setStatePropAsync: (action: DispatchActionAsync<State>) => any;
}, any>;
export declare type PropsType<State = {}, TOwnProps = {}, TStateProps = {}, TDispatchProps = {}> = TStateProps & TDispatchProps & TOwnProps & {
    setStateProp: (action: DispatchActionSync<State>) => typeof action;
    setStatePropAsync: (action: DispatchActionAsync<State>) => typeof action;
};
export {};
