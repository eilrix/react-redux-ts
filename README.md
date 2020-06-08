# react-redux-ts
Simplifies workflow with redux and react-redux

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

## 2. Simple and safe type actions
Allows to use type definitions as actions instead of objects.


##### Actions.ts:

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


##### CustomReducer.ts:
```typescript
import { CustomActionTypes } from '../actions/Actions';
import { StateType } from '../Store';

export function CustomReducer(state: StateType, action: CustomActionTypes<StateType>): StateType {
  switch (action.type) {
    case 'ValidateField':
      console.log('ValidateField');
      return state;
      break;
    default:
        console.log('default');
      	return state;
  }
};
```

##### Store.ts:
```typescript
import { createStore } from 'react-redux-ts';
import { CustomActionTypes } from './actions/Actions';
import { CustomReducer } from './reducers/CustomReducer';
class State { 
    myProp: string = '';
}
export type StateType = typeof State;

const store = createStore<StateType, CustomActionTypes<StateType>>(
    CustomReducer, new State());

export type DispatchType = typeof store.dispatch;
export type StoreAction = ReturnType<typeof store.dispatch>;
```

##### MyComponent.tsx:
```typescript
import { connect, PropsType } from 'react-redux-ts';
import { StateType, DispatchType } from './Store.ts';
const mapStateToProps = (state: StateType, ownProps) => {
    return {
        myProp: state.myProp
    }
}
const mapDispatchToProps = (dispatch: DispatchType, ownProps) => {
    return {
        handleNext: () => dispatch({ type: 'NextPage' }),
        dispatch
    }
}
type MyComponentPropsType = PropsType<StateType, {}, ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps>>;

const MyComponent = (props: MyComponentPropsType) => {
    return (
        <div
            onClick={() => {
                this.props.dispatch({
                    type: 'SET_PROP',
                    prop: 'myProp',
                    payload: 'val'
                });
                props.handleNext();
            }}
        >{props.myProp}</div>
    )
}

export const ConnectedMyComponent = connect(mapStateToProps, mapDispatchToProps)(MyComponent);
```

