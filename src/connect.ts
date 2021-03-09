import * as redux from "redux";
import { Action } from "redux";
import * as reactRedux from 'react-redux';
import { DispatchActionSync, DispatchActionAsync } from './types';

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