import { DispatchActionSync, DispatchActionAsync, SetActionSync, SetActionAsync } from './types';
import * as redux from "redux";

export const getSetStateProp = <State>(dispatch: redux.Dispatch<SetActionSync<State>>) => {
    return (action: DispatchActionSync<State>) => dispatch({
        type: 'SET_PROP',
        prop: action.prop,
        payload: action.payload
    });
}

export const getSetStatePropAsync = <State>(dispatch: redux.Dispatch<SetActionAsync<State>>) => {
    return (action: DispatchActionAsync<State>) => dispatch({
        type: 'SET_PROP_ASYNC',
        prop: action.prop,
        func: action.func
    });
}
