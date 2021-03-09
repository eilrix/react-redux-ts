# react-redux-ts
Typescript wrapper around redux and react-redux that simplifies workflow

```sh
npm i react-redux-ts
```


## 1. Simple set
Adds a common action to set any value in the store with typechecks.
Without async:
```typescript
store.dispatch({
    type: 'SET_PROP',
    prop: 'myProp',
    payload: 'val'
});
```
And async (similar to Redux-thunk):
```typescript
store.dispatch({
    type: 'SET_PROP_ASYNC',
    prop: 'myProp',
    func: myAsyncFunction
});
```
Will ensure that 'payload' in SET_PROP and return value of 'func' in SET_PROP_ASYNC has the same type as property in the store.

Async version will also dispatch notifications in order:
- start
- success / error
- end

Will also add both methods as props to connected react component
```typescript
props.setStateProp({
    prop: 'myProp',
    payload: 'val'
});
props.setStatePropAsync({
    prop: 'myProp',
    func: myAsyncFunction
});
```


## 2. Simple and safe type actions
Allows to use type definitions as actions instead of objects.


##### actions.ts:

```typescript
type NextPageAction = {
  type: 'NextPage';
};

type ValidateFieldAction<State> = {
  type: 'ValidateField';
  payload: (keyof State)[];
};

export type CustomActionTypes<State> = NextPageAction | ValidateFieldAction<State>;
```


##### customReducer.ts:
```typescript
import { CustomActionTypes } from '../actions';
import { StateType } from '../store';

export function customReducer(state: StateType, action: CustomActionTypes<StateType>): StateType {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
      break;
    default:
      	return state;
  }
};
```


##### store.ts:
```typescript
import { createStore } from 'react-redux-ts';
import { CustomActionTypes } from './actions';
import { customReducer } from './customReducer';

class State { 
    myProp: string = '';
}

// All arguments of createStore are optional. It accepts your root reducer, initial state, 
// boolean for whether or not use devtools, array of middlewares.
export const store = createStore<State, CustomActionTypes<State>>(
    customReducer, new State());

export type DispatchType = typeof store.dispatch;
export type StoreAction = ReturnType<typeof store.dispatch>;
export type StateType = typeof State;
```


##### AppComponent.tsx:
```typescript
import { connect, PropsType } from 'react-redux-ts';
import { StateType, DispatchType } from './store.ts';
const mapStateToProps = (state: StateType, ownProps) => {
    return {
        myProp: state.myProp
    }
}
const mapDispatchToProps = (dispatch: DispatchType, ownProps) => {
    return {
        handleNext: () => dispatch({ type: 'NextPage' })
    }
}
type AppComponentPropsType = PropsType<StateType, {}, ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps>>;

const AppComponent = (props: AppComponentPropsType) => {
    return (
        <div
            onClick={() => {
                props.setStateProp({
                    prop: 'myProp',
                    payload: 'val'
                });
                props.handleNext();
            }}
        >{props.myProp}</div>
    )
}

const connectedComponent = connect(mapStateToProps, mapDispatchToProps)(AppComponent);
export default connectedComponent;
```


##### index.tsx:
```typescript
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux-ts'
import store from './store'
import AppComponent from './AppComponent'

const rootElement = document.getElementById('root')
ReactDOM.render(
  <Provider store={store}>
    <AppComponent />
  </Provider>,
  rootElement
)
```
