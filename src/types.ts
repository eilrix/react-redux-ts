// DEFAULT "SET ACTIONS" DEFINITIONS //

export type SetActionSync<StateType> = { [K in keyof StateType]: {
    type: 'SET_PROP';
    prop: K;
    payload: StateType[K];
} }[keyof StateType];

export type SetActionAsync<StateType> = { [K in keyof StateType]: {
    type: 'SET_PROP_ASYNC';
    prop: K;
    func: () => Promise<StateType[K]>;
} }[keyof StateType];

export type AsyncStatus = 'start' | 'error' | 'success' | 'end';

export type NotifySetActionAsync<StateType> = { [K in keyof StateType]: {
    type: 'NOTIFY_SET_PROP_ASYNC';
    prop: K;
    status: AsyncStatus;
    response?: StateType[K];
} }[keyof StateType];

export type SetActionType<S> = SetActionSync<S> | SetActionAsync<S> | NotifySetActionAsync<S>;

export type DispatchActionSync<StateType> = { [K in keyof StateType]: {
    prop: K;
    payload: StateType[K];
} }[keyof StateType];

export type DispatchActionAsync<StateType> = { [K in keyof StateType]: {
    prop: K;
    func: () => Promise<StateType[K]>;
} }[keyof StateType];



export type PropsType<State = Record<string, unknown>, TOwnProps = Record<string, unknown>,
    TStateProps = Record<string, unknown>, TDispatchProps = Record<string, unknown>> =
    TStateProps & TDispatchProps & TOwnProps & {
        setStateProp: (action: DispatchActionSync<State>) => typeof action;
        setStatePropAsync: (action: DispatchActionAsync<State>) => typeof action;
    };
