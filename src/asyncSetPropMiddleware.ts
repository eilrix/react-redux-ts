import * as redux from "redux";
import { Middleware } from "redux";
import { SetActionType } from './types';

// ASYNC SET PROP MIDDDLEWARE //

/**
 * Redux's middleware that takes actions with provided functions. 
 * Waits until returned promise resolved and then saves value to the store
 *
 * @template StateType The type of state held by the store.
 */
export function makeAsyncSetPropMiddleware<StateType, DispatchExt, StateExt>(): Middleware<DispatchExt, StateExt, redux.Dispatch> {
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




